---
pubDatetime: 2017-09-27T06:50:27Z
title: "Horizon Client Stealing my Mouse"
tags:
  - "horizon"
  - "Linux"
  - "vmware"
description: "On my Linux VMWare Horizon client (v4.5.0 5650368) it doesn't seem to matter what choice I make about NOT Connecting USB Devices at Startup it still continued to take over my Logitech USB Receiver."
---
On my Linux VMWare Horizon client (v4.5.0 5650368) it doesn't seem to matter what choice I make about NOT Connecting USB Devices at Startup it still continued to take over my Logitech USB Receiver. I'd have to use the keyboard and navigate the menu so I could get control of my mouse back. Thankfully I don't have a Logitech keyboard that uses the same receiver. It was an easy fix, but I don't know why it does it. The permissions to the `~/.vmware` folder and files all seem OK. IT's an easy fix of just editing the file `view-preferences` and amending the line or lines as follows.

    $ vi ~/.vmware/view-preferences
    ...
    view.usbAutoConnectAtStartUp = "FALSE"
    view.usbAutoConnectOnInsert = "FALSE"
    ...
