---
pubDatetime: 2018-07-08T11:38:36Z
modDatetime: 2018-07-12T16:29:15Z
title: "Project scoRPIon - Wake-on-WiFi"
tags:
  - "JavaScript"
  - "Linux"
  - "node.js"
  - "Privateer"
  - "raspberry pi"
  - "Web"
heroImage: "/blog-media/2018/07/scorpion400.png"
description: "A friend setup his home systems to turn on his PC using Amazon Alexa and tasker to trigger a Raspberry Pi to operate a relay and effectively activate the p"
---
A friend setup his home systems to turn on his PC using Amazon Alexa and tasker to trigger a Raspberry Pi to operate a relay and effectively activate the power button.

> **What a wonderful idea!**

I have a host of Raspberry Pi's, but instead of Alexa I have chosen the Google Home (Assistant) for my voice control. My PC is located upstairs from my router and connects using 802.11ac WiFi. Being WiFi that rules out using Wake-on-LAN, which I used to do. So using a RPI to trigger a relay is genius. As far as the Raspberry Pi goes I'm a coder. I can write code. When it comes to the electronics I really struggle with the electrickery parts. But all this involves is a single 5v relay. A relay is a switch that uses low voltage to make a high voltage connection. But in my case I'm just using a relay to connect/short the PC's low voltage motherboard jumper in the same way as the PC's case power button does.. It's a momentary low voltage connection that when the motherboard sees connected powers on the the PC. So all I have to do is replace the power button with my relay and RPI.

## The Raspberry Pi

I decided on the Raspberry Pi Zero W. This makes for a very clean small unit that already has WiFi built in so I don't need a WiFi USB dongle or a Pi HAT. The idea is the Pi stays connected to my LAN and when I send it the signal it trips the relay. For processing the signal I need a web service. That's the bit I talk to and tell it to power on my PC. It's a RPI so I need a lightweight server with extensions that can talk to GPIO - Node.js and Express!

## The Web Service

Using Node.js and Express gave me a simple interface to serve HTTP and handle requests. Add to that the `gpio` program I can then use Node.js to talk to the RPI GPIO. So now when I send a HTTP request to the Express server Node.js can process it and trigger a GPIO port to do something - like activate a relay. Taking it a step further I wanted to make it work with my Google Home. The obvious way was to use "if this then that" (IFTTT.com) and a webhook. So now I can talk to my Google Home, it passes the request to [IFTTT.com](https://ifttt.com) which then sends a web request to my RPI's express server. Of course I built in some simple security. You need a token passed in `json` format to make express process the request. ![ifttt_scorpion](/blog-media/2018/07/ifttt_scorpion.png)

## The Web browser

I then extended the idea of just a web service into a human readable web page interface. So now I can just use a browser to access a form style page and power on my PC using a mobile phone browser - as long as I know the token. I've since added `tcp-ping`​ and `socket.io`into the project so now the web GUI gets updated with when the PC is on or not. I use it to check if port 445 is accessible on the PC and if it is then the web interface updates to show the status. ![Capture](/blog-media/2018/07/capture.png)

## Items of Note

It's worth noting that my PC maintains power to one or two USB ports even when it's off - as long as it's not off at the wall outlet. So I can power my RPI Zero W from the PC that I'm going to turn on with my RPI. No need of any additional power sockets or transformers.

## On Github

You'll find the full project here: [https://github.com/warlord0/scorpion](https://github.com/warlord0/scorpion) It works with Node v8
