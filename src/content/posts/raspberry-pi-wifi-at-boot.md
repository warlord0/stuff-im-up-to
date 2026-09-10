---
pubDatetime: 2018-06-26T19:43:27Z
modDatetime: 2019-03-30T20:22:22Z
title: "Raspberry Pi Wifi at boot"
tags:
  - "Linux"
  - "Networking"
  - "Privateer"
  - "raspberry pi"
heroImage: "/blog-media/2016/09/raspberry_pi_wallpaper_hd_1080p_by_tpbarratt-d4suve2.jpg"
description: "You can configure the Raspberry Pi raspbian image to have the details of your Wifi network at boot time - so no more hunting for keyboards and HDMI cables"
---
You can configure the Raspberry Pi raspbian image to have the details of your Wifi network at boot time - so no more hunting for keyboards and HDMI cables to fire it up onto your WLAN.

https://www.raspberrypi-spy.co.uk/2017/04/manually-setting-up-pi-wifi-using-wpa_supplicant-conf/

#### wpa_supplicant.conf

```
country=gb
update_config=1
ctrl_interface=/var/run/wpa_supplicant
network={
  scan_ssid=1
  ssid="MyNetworkSSID"
  psk="Pa55w0rd1234"
} 
```

Also create an empty file called `ssh` to start the sshd daemon on boot.
