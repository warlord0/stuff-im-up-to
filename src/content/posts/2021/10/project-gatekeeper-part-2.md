---
pubDatetime: 2021-10-29T18:50:00Z
modDatetime: 2021-10-30T13:59:01Z
title: "Project Gatekeeper, Part 2"
tags:
  - "electronics"
  - "esp8266"
  - "Linux"
heroImage: "/blog-media/2021/10/mosquitto.png"
description: "Following on from ESP8266 Real-World Project where I explained the electronics side of the project, this article continues to cover the other aspects of th"
---
Following on from [ESP8266 Real-World Project](https://warlord0blog.wordpress.com/2021/10/28/esp8266-real-world-project/) where I explained the electronics side of the project, this article continues to cover the other aspects of the setup, this focusses on MQTT on the Raspberry Pi.

I happened to have a few Raspberry Pi's lying around and repurposed one to handle the authentication side of the Gatekeeper. It's not going to be overly stressed by operating a few doors and should be well up to the task.

After installing Rasbian I added onto it Mosquitto MQTT.

```
sudo apt install mosquitto
```

MQTT is very popular in the home automation world. It serves as a command and control mechanisms for smart devices like lightbulbs and TV's etc. It's a very simple message queuing system. Something drops a message into the queue, something else reads the message from the queue - it really is that simple.

More correctly, the terms used are topics and payloads - we subscribe to topics and read and write payloads into topics. If other devices are subscribed and listening to those same topics, they will get the payload.

The payload can be almost anything in any structure you like. A simple word or number, XML or json. MQTT doesn't really care, it's up to the subscribers to handle reading and writing it.

In the case of Tasmota the topics relate to the devices and the payloads instruct the device on what to do. A simple example would be to send a command to turn the power on would be to post a payload of "`ON`" into the topic "`cmnd/DEVICE/Power`". Where DEVICE is the unique name of the device. Once the device sees this, it turns the power on.

There's nothing special that you need to do to connect Tasmota to MQTT. IT supports it out of the box and creates it's own topics as it connects (See [Tasmota MQTT](https://tasmota.github.io/docs/MQTT/)). However, I want to add a bit more security to my build. The payloads should go over a TLS encrypted link, and the topics should be protected so that only the Gatekeeper can write messages to the Gates.

To do this I added the following directives to the Tasmota build file `user_config_override.h`.

```
#ifndef USE_MQTT_TLS
#define USE_MQTT_TLS true // Use TLS for MQTT connection (+34.5k code, +7.0k mem and +4.8k additional during connection handshake)
//  #define USE_MQTT_TLS_CA_CERT                  // Force full CA validation instead of fingerprints, slower, but simpler to use.  (+2.2k code, +1.9k mem during connection handshake)
// This includes the LetsEncrypt CA in tasmota_ca.ino for verifying server certificates
//  #define USE_MQTT_TLS_FORCE_EC_CIPHER          // Force Elliptic Curve cipher (higher security) required by some servers (automatically enabled with USE_MQTT_AWS_IOT) (+11.4k code, +0.4k mem)
#endif
```

This enables MQTT over TLS (See [TLS Secured MQTT](https://tasmota.github.io/docs/TLS/))

I'm not going to use valid certificates for this example. Tasmota has a nice feature where it will store the fingerprint of the first certificate it connects to. Then, if the certificate somehow changes, it won't just continue blindly connecting to an unknown broker without your intervention.

Create the key pair on the Raspberry Pi using:

```
sudo mkdir -p /etc/mosquitto/certs/
sudo openssl req -newkey rsa:2048 -nodes -keyout /etc/mosquitto/certs/mqtt.key -x509 -days 3650 -out /etc/mosquitto/certs/mqtt.crt
sudo chown mosquitto: /etc/mosquitto/certs/* /etc/mosquitto/passwd
sudo chmod go-rw /etc/mosquitto/certs/*.key
```

This gives us a certificate valid for the next ten years. In reality, we're not checking if it expired anyway.

Then create and edit the file `/etc/mosquito/conf.d/mqtt.conf`

```
listener 8883
 
cafile   /etc/mosquitto/certs/mqtt.crt
certfile /etc/mosquitto/certs/mqtt.crt
keyfile  /etc/mosquitto/certs/mqtt.key

password_file /etc/mosquitto/passwd
```

Now we need to create the password file that Tasmota devices are going to use to authenticate with.

```
sudo mosquitto_passwd -c /etc/mosquitto/passwd gatekeeper
sudo mosquitto_passwd /etc/mosquitto/passwd gate
```

This creates users gatekeeper and gate by asking you for a password for each.

Restart mosquitto:

```
sudo systemctl restart mosquitto
```

## Using ACL's

You can secure Mosquitto further by using an Access Control List.

Create the file `/etc/mosquitto/acl` using:

```
sudo vi /etc/mosquitto/acl
```

Add in the following:

```
topic read $SYS/#

pattern readwrite /tele/%c/#
pattern readwrite /stat/%c/#
pattern readwrite /tasmota/discovery/%c/#

user gatekeeper
pattern readwrite /#
```

This will prevent Tasmota clients from being able to read and write to anything other than their own topics. The gatekeeper user will have full access to all topics, the `/#` is a wildcard.

Enable the `acl` by adding this line to the `/etc/mosquitto/conf.d/mqtt.conf` and then restart mosquitto.

```
acl_file /etc/mosquitto/acl
```

## Testing with an MQTT Desktop Client

A good client to use to test the setup is [MQTT-Explorer](https://github.com/thomasnordquist/MQTT-Explorer/releases/tag/v0.3.5). If you sign in as gatekeeper you can see all the messages from all the Tasmotas you have.

Download the relevant release for Linux, eg. `MQTT-Explorer-0.4.0-beta1.AppImage`

```
chmod +x MQTT-Explorer-0.4.0-beta1.AppImage
./MQTT-Explorer-0.4.0-beta1.AppImage
```

Enter the details to connect to the RPi, eg. Name/IP Address, Port is 8883 and specify the gatekeeper user and password you created above.

**NOTE**: As we’re using a self-signed cert, you need to uncheck the Validate certificate option.

You can then test sending commands to the Tasmota by posting a payload into the relevant `cmnd` topic.

## Setup mDNS (optional)

In order for devices to find the gatekeeper by name, I set up mDNS to let everything know what the device is called and what service it provides. This means I can refer to the RPi as `gatekeeper.local` on the network and the name will resolve to the IP address.

Install the `avahi-daemon`

```
sudo apt install avahi-daemon
```

Create and edit the file `/etc/avahi/services/mqtt.service`

```
<!DOCTYPE service-group SYSTEM "avahi-service.dtd">
<service-group>
 <name replace-wildcards="yes">MQTT server on %h</name>
  <service>
   <type>_mqtt._tcp</type>
   <port>8883</port>
   <txt-record>info=Gatekeeper of Gozer</txt-record>
  </service>
</service-group>
```

Edit the file `/etc/avahi/avahi-daemon.conf` and set the host name to `gatekeeper`:

```
host-name=gatekeeper
```

Enable and restart the `avahi-daemon`.

```
sudo systemctl enable avahi-daemon
sudo systemctl restart avahi-daemon
```

Now you should be able to test it by pinging it by name:

```
$ ping gatekeeper.local
PING gatekeeper.local (192.168.0.2) 56(84) bytes of data.
64 bytes from 192.168.0.204 (192.168.0.2): icmp_seq=1 ttl=64 time=0.173 ms
64 bytes from 192.168.0.204 (192.168.0.2): icmp_seq=2 ttl=64 time=0.154 ms
```

You can now configure your clients to connect to it using the name instead of IP address.

If you can't resolve the name from your other systems, it's probably because you haven't got the `avahi-daemon` installed and running. You can install it in the same way as above, but there's no need to edit and configure any files.

## References

[ESP8266 Real-World Project](https://warlord0blog.wordpress.com/2021/10/28/esp8266-real-world-project/)

[Project Gatekeeper, Part 3](https://warlord0blog.wordpress.com/2021/10/30/project-gatekeeper-part-3/)
