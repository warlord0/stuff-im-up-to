---
pubDatetime: 2021-10-11T21:56:00Z
modDatetime: 2021-10-29T11:06:07Z
title: "ESP Programming"
tags:
  - "arduino"
  - "electronics"
  - "esp32"
  - "esp8266"
heroImage: "/blog-media/2021/10/esp8266-12e-pinout-13.jpg"
description: "Using either the ESP32 or ESP8266 there are a few things I've learned that I should make note of: GPIO n != D n When looking for the pin numbers to wire to"
---
Using either the ESP32 or ESP8266 there are a few things I've learned that I should make note of:

## **GPIO*n* != D*n***

When looking for the pin numbers to wire to, or in a configuration, DO NOT mix up GPIO*n* numbers with the markings on the board for D*n*, eg. GPIO1 != D1 on the board.

Looking at the diagram you'll see pins on the board labelled D0, D1, D2, D3, etc. but also note they are not related to the GPIO*n* numbers they actually represent.

![](/blog-media/2021/10/esp8266-12e-pinout-13.jpg)

## DHT Sensors are NOT the same

I have a DHT of some kind, I thought it was a DHT11 - it's not. I checked what I bought last year, and they shipped DHT22's. In [Tasmota](https://tasmota.github.io/docs/) there is no DHT22 option, but there is an AM2301 which is what I should use.

Oddly, the Arduino ESP DHT library has no problem reading the right data, but Tasmota was wildly out when I used DHT11.

## Shut Down Arduino IDE when using esptool.py

I thought I'd borked one of my ESP's when flashing it with the esptool.py. Turns out the Arduino serial monitor must have been using the `/dev/ttyUSB0` port and it caused all kinds of weirdness, requiring me to erase the flash and re-flash to get it working.

## Pay Attention to What GPIO's can be used

Not all GPIO's can be used for what you'd like. Some of them cause boot failure if they are set LOW. This is a very useful site to figure out what you can use.

https://randomnerdtutorials.com/esp8266-pinout-reference-gpios/
