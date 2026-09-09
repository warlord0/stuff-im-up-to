---
pubDatetime: 2021-10-30T13:44:46Z
modDatetime: 2021-10-30T13:57:23Z
title: "Project Gatekeeper, Part 3"
tags:
  - "electronics"
  - "python"
  - "Uncategorized"
description: "This article covers the python programming used to control the gates. At this stage I'll post some snippets and ideas on why and how I do things this way,"
---
This article covers the python programming used to control the gates. At this stage I'll post some snippets and ideas on why and how I do things this way, eventually I'll probably post the whole code to a public github repository, so you can access it all.

## Why Python?

It's a common language and already available on the Raspberry Pi. It has all the libraries I need to read and write to MQTT, authenticate against LDAP and send email messages.

The key library for this is the `paho.mqtt` library. This will process my MQTT topics and payloads.

This and the other libraries I installed I've added to the `requirements.txt` file:

```
ConfigArgParse==1.5
paho-mqtt==1.5.1
python-ldap==3.3.1
```

I'm using configparser to process an .ini file that contains all the settings required.

```
[settings]
client_name=
broker_username=
broker_password=
broker_port=
; Order is important. We need to discover first!
mqtt_topics="tasmota/discovery/#", "tele/#"
ldap_uri=
ldap_bind_dn=
ldap_bind_pw=
ldap_base_ou=
ldap_card_attribute=
ldap_schedule_attribute=
smtp_server=
smtp_port=
smtp_username=
smtp_password=
; no, ssl or starttls
smtp_secure=
smtp_sender=
```

Read in the settings using configparrser

```
config_object = ConfigParser()
config_object.read("settings.ini")
settings = config_object["settings"]

CLIENT_NAME = settings.get("CLIENT_NAME", "gatekeeper")
BROKER_USERNAME = settings.get("BROKER_USERNAME", "gatekeeper")
BROKER_PASSWORD = settings.get("BROKER_PASSWORD", "SecretKey")
BROKER_ADDRESS = settings.get("BROKER_ADDRESS", "mqtt.local")
BROKER_PORT = settings.getint("BROKER_PORT", 1883)
LDAP_URI = settings.get("LDAP_URI", "ldap://localhost:389")
LDAP_BIND_DN = settings.get("LDAP_BIND_DN", "cn=readonly,dc=domain,dc=tld")
LDAP_BIND_PW = settings.get("LDAP_BIND_PW", "SecretKey")
LDAP_BASE_OU = settings.get("LDAP_BASE_OU", "dc=domain,dc=tld")
LDAP_CARD_ATTRIBUTE = settings.get("LDAP_CARD_ATTRIBUTE", "employeeNumber")
LDAP_PIN_ATTRIBUTE = settings.get("LDAP_PIN_ATTRIBUTE", "departmentNumber")
LDAP_SCHEDULE_ATTRIBUTE = settings.get("LDAP_SCHEDULE_ATTRIBUTE", "info")
LOG_PATH = settings.get("LOG_PATH", "./logs")
SMTP_SERVER = settings.get("SMTP_SERVER", "localhost")
SMTP_PORT = int(settings.get("SMTP_PORT", 25))
SMTP_SECURE = str(settings.get("SMTP_SECURE", "no"))
SMTP_USERNAME = settings.get("SMTP_USERNAME", "")
SMTP_PASSWORD = settings.get("SMTP_PASSWORD", "")
SMTP_SENDER = settings.get("SMTP_SENDER", "gatekeeper@localhost")
```

The way I've constructed things is using classes and inheritance. My gatekeeper class does much of the heavy lifting. It takes the MQTT payloads and handles the logic processing. It is based on my MQTTWrapper class that provides the functions to connect and subscribe to the broker topics. It provides the event triggers for when the broker is connected, and for when the message is received.

Other classes I have are the logwrapper. This handles writing output to the console and log files, so I can see what is going on in my code.

The smtpwrapper simplifies calls to the `smtplib` to send email messages when events need escalation, eg. when the gate is tampered with or the door is forced open.

### gatekeeper.py

I use some private variables to track the status of gates.

```
class Gatekeeper(MQTTWrapper):

    _card = ""  # Active card
    _pin = ""  # Active pin
    _scan_time = None
    _attempts = {}  # Failed card+pin attempts
    _jail = {}  # Cards that are in jail
    _jail_time = 10  # In minutes
    _max_attempts = 3  # No of card and pin check attempts
    _discovered = {}  # List of discovered devices
    _tampered = {}  # List of gates that show tamper alert
```

If the card has hit the `_max_attempts` then it is put into `_jail`. When a card is in jail, it is ignored until it meets its parole date. For now I'm tar pitting the attempts by ignoring only for 10 minutes.

```
    def check_jail(self, card):
        """
        See if the card is currently in jail
        :param card: the card uid
        :type card: string
        :return: True if the card is in jail
        :rtype: boolean
        """
        self._logger.debug(f"JAIL: {self._jail}")
        inmate = self._jail.get(card, {})
        if inmate:
            self._logger.debug(f"CARD: {card} IS IN JAIL!")
            parole = inmate.get("date", datetime.now())
            if parole <= datetime.now() - timedelta(minutes=self._jail_time):
                # Sentence has been served release it and reset the attempts
                self._logger.debug(f"Releasing {card} from jail.")
                self._attempts.pop(card)
                self._jail.pop(card)
                return False
            self._card = self._pin = ""
            return True
        else:
            self._logger.debug(f"card: {card} is not in jail")
            return False
```

If a gate is tampered with, send an email and add the gate to the `_tampered` list. Gates on the tampered list are ignored.

```
    def tamper_alert(self, topic, payload):
        self._logger.debug(f"gate: topic[1] tamper: {payload}")
        if payload == "ON":
            client_id = topic[1]
            self._tampered.update({client_id: datetime.now()})
            smtp_server = SMTPWrapper(
                SMTP_SERVER,
                SMTP_PORT,
                SMTP_USERNAME,
                SMTP_PASSWORD,
                secure=SMTP_SECURE,
            )
            message = f"""\
Subject: GATEKEEPER TAMPER ALERT

The gate at {client_id} has triggered a tamper alert.

Current state:

TAMPER: {payload}
            """
            smtp_server.send(EMAIL, message, SMTP_SENDER)
```

When a gate comes online, it changes it's `LWT` (Last Will and Testament) setting to show it is "Online". If it disconnects, MQTT will change it to "Offline". I use this to carry out the configuration of the gate as soon as it connects.

```
    def process_lwt(self, topic, payload):
        """
        Handle the Last Will and Testament (LWT) of Online/Offline notifications
        """
        client_id = topic[1]

        if client_id in self._discovered:
            # If we have discoverd a tasmota device
            if payload.lower() == "online":
                """
                When a gate comes online send it the configuration for the switches, etc.
                """
                self._logger.info(f"online:  {client_id} Initialising")

                cmnds = []
                # Set options
                cmnds.append(
                    {
                        "id": "backlog",
                        "cmnd": "SetOption1 1; SetOption13 1; SetOption73 1; SwitchMode3 1; SwitchMode4 2; WebButton1 Door; WebButton2 Beeper; LedState 1; LedMask 0x0001; Rule1 1",
                    }
                )
                # Create rules (one rule contains many actions)
                cmnds.append(
                    {
                        "id": "rule1",
                        "cmnd": """on switch3#state=1 do publish2 tele/%topic%/DOOR OPEN endon
on switch3#state=0 do publish2 tele/%topic%/DOOR CLOSED endon 
on switch4#state=1 do publish2 tele/%topic%/TAMPER ON endon 
on switch4#state=0 do publish2 tele/%topic%/TAMPER OFF endon
on Button1#state=10 do Power1 1 endon
on Power1#state=1 do BackLog LedPower1 on; Power2 on; RuleTimer1 2 endon
on Rules#Timer=1 do BackLog LedPower1 off; Power2 off; Power1 off endon""",
                    }
                )
                for cmnd in cmnds:
                    self._logger.debug(f"cmnd: {topic[1]} {cmnd['cmnd']}")
                    self.client.publish(f"cmnd/{client_id}/{cmnd['id']}", cmnd["cmnd"])

            elif payload.lower() == "offline":
                self._logger.info(f"offline: {client_id}")
```

You can see that it sends commands to create Rule1 with triggers for events such as the door and tamper status, but also the power event. When a gate is given power to open the door, it turns o nthe led, makes the keypad beep and the rule triggers a timer that will remove the power after 2 seconds.

Using LWT like this means I just have to flash a gate with Tasmota and as soon as it connects it will get configured.

## References

[ESP8266 Real-World Project](https://warlord0blog.wordpress.com/2021/10/28/esp8266-real-world-project/) - Project Gatekeeper, Part 1

[Project Gatekeeper, Part 2](https://warlord0blog.wordpress.com/2021/10/29/project-gatekeeper-part-2/)
