---
pubDatetime: 2022-07-21T09:21:46Z
modDatetime: 2022-07-21T09:23:46Z
title: "Python Motion Sensor"
tags:
  - "electronics"
  - "python"
heroImage: "/blog-media/2021/01/python.png"
description: "I wanted to add a motion sensor into a Python project that would activate a display to show the temperature only when someone was nearby. The AM312/HC-SR31"
---
I wanted to add a motion sensor into a Python project that would activate a display to show the temperature only when someone was nearby.

The AM312/HC-SR312 is a cheap, tiny passive infrared sensor that trips for 3 seconds when motion/heat is detected. It only has three wires, VIN, OUT, and GND. The VIN is 5v and the OUT is a 3.3v GPIO input, with GND being ground.

With a Raspberry Pi connect the VIN to pin 2 (5v), GND to pin 6 (gnd) and OUT to pin 36 (gpio 16).

Rather than have a python loop constantly polling, I wanted to use an event callback. This means when gpio 16 is triggered high, then python will run my callback program. Much tidier than trying to handle loops with multiple tasks. With gpio 16 I was able to get events triggering my callback. It's worth noting that on other boards, not all gpio pins support interrupts. You'll need to look out for this if you are using ESP modules and pick appropriate pins that do.

```
#!/usr/bin/env python3

import signal
import sys
import RPi.GPIO as GPIO
import datetime

PIR_GPIO = 16

def signal_handler(sig, frame):
    GPIO.cleanup()
    sys.exit(0)

def motion_callback(channel):
    now = datetime.datetime.now()
    print("%s Motion Detected!" % str(now))

if __name__ == '__main__':
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(PIR_GPIO, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    GPIO.add_event_detect(PIR_GPIO, GPIO.RISING, 
            callback=motion_callback, bouncetime=2500)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.pause()
```

This is based on the tutorial code here: [https://roboticsbackend.com/raspberry-pi-gpio-interrupts-tutorial/](https://roboticsbackend.com/raspberry-pi-gpio-interrupts-tutorial/)

We use `add_event_detect` to trigger the `callback` function `motion_callback` when pin 16 detects a `RISING` of voltage. The `bouncetime` prevents repetitive calls being made within 2.5seconds - probably unnecessary as the PIR only triggers every 3 seconds for 3 seconds, when motion is detected.

My plans for this are to link with MQTT and send messages that other systems can act on, or turn on a display and show the current temperature (a bit like Nest).

## References

[https://roboticsbackend.com/raspberry-pi-gpio-interrupts-tutorial/](https://roboticsbackend.com/raspberry-pi-gpio-interrupts-tutorial/)
