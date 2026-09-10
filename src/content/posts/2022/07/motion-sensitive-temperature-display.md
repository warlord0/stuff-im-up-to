---
pubDatetime: 2022-07-23T11:13:22Z
modDatetime: 2022-08-23T21:03:24Z
title: "Motion Sensitive Temperature Display"
tags:
  - "electronics"
  - "python"
heroImage: "/blog-media/2016/09/raspberry_pi_wallpaper_hd_1080p_by_tpbarratt-d4suve2.jpg"
description: "Following on from Python Motion Sensor I put together a 2004 LCD display, DHT11 humidity and temperature sensor and the AM312 PIR and came up with a displa"
---
Following on from [Python Motion Sensor](https://warlord0blog.wordpress.com/2022/07/21/python-motion-sensor/) I put together a 2004 LCD display, DHT11 humidity and temperature sensor and the AM312 PIR and came up with a display that is triggered when motion is detected.

To get things going, I needed to install the `RPiI2C_Driver` and `Adafruit_DHT` library and this is the result.

```
#!/usr/bin/env python3

import signal
import sys
import RPi.GPIO as GPIO
import datetime
import RPi_I2C_driver
import time
import Adafruit_DHT

PIR_GPIO = 16

DHT_SENSOR = Adafruit_DHT.DHT22
DHT_PIN = 4

mylcd = RPi_I2C_driver.lcd()
mylcd.lcd_clear()
mylcd.backlight(0)

def signal_handler(sig, frame):
    GPIO.cleanup()
    sys.exit(0)

def motion_callback(channel):
    now = datetime.datetime.now()
    print("%s Motion Detected!" % str(now))
    mylcd.backlight(1)
    mylcd.lcd_display_string("%s" % n


ow.strftime("%a %d %B %Y"), 1)
    mylcd.lcd_display_string("%s" % now.strftime("%H:%M:%S"), 2)
    humidity, temperature = Adafruit_DHT.read_retry(DHT_SENSOR, DHT_PIN)
    mylcd.lcd_display_string("Temperature : %.1f C" % temperature, 3)
    mylcd.lcd_display_string("Humidity    : %.1f %%" % humidity, 4)
    time.sleep(7)
    mylcd.lcd_clear()
    mylcd.backlight(0)

if __name__ == '__main__':
    GPIO.setmode(GPIO.BCM)
    GPIO.setup(PIR_GPIO, GPIO.IN, pull_up_down=GPIO.PUD_UP)

    GPIO.add_event_detect(PIR_GPIO, GPIO.RISING, 
            callback=motion_callback, bouncetime=1000)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.pause()
```

I bought the 2004 (20 columns x 4 rows) LCD with an I2C already built in. I didn't want to spend all that wiring to the Pi without simplifying it down to 4 wires for I2C.

For the build, I used a Pi Model B+ for this, as I had one lying around.

![](/blog-media/2022/07/motion_sensor-1.png)

|                 |             |
|-----------------|-------------|
| Raspberry Pi    |             |
| Pin 1 - 3.3v    | DHT11 - VCC |
| Pin 2 - 5v      | PIR - VCC   |
| Pin 3 - SDA     | LCD - SDA   |
| Pin 4 - 5v      | LCD - VCC   |
| Pin 5 - SCL     | LCD - SCL   |
| Pin 6 - GND     | PIR - GND   |
| Pin 7 - GPIO4   | DHT11 - OUT |
| Pin 14 - GND    | DHT11 - GND |
| Pin 20 - GND    | LCD - GND   |
| Pin 36 - GPIO16 | PIR - OUT   |

To improve on this, I would probably fetch the temperature every minute and use the last reading to display when motion is detected. In its current state there is a delay when the display activates, shows the time and date, and then fetches the temperature and humidity readings from the dht sensor.
