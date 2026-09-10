---
pubDatetime: 2024-07-24T11:10:33Z
title: "Disable Wi-Fi on Ethernet Up"
tags:
  - "Linux"
  - "Networking"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "I wanted to turn off/disable my Wi-Fi adapter when I plug in an Ethernet cable. Add this script as /etc/NetworkManager/dispatcher.d/99-disable-wifi-when-et"
---
I wanted to turn off/disable my Wi-Fi adapter when I plug in an Ethernet cable.

Add this script as `/etc/NetworkManager/dispatcher.d/99-disable-wifi-when-ethernet-connected.sh` grant it executable permissions.

```
#!/bin/sh
myname=${0##*/}
log() { logger -p user.info -t "${myname}[$$]" "$*"; }
IFACE=$1
ACTION=$2

release=$(lsb_release -s -c)
case ${release} in
trusty | utopic) nmobj=nm ;;
*) nmobj=radio ;;
esac

case ${IFACE} in
eth* | usb* | en*)
    case ${ACTION} in
    up)
        log "disabling wifi radio"
        nmcli "${nmobj}" wifi off
        ;;
    down)
        log "enabling wifi radio"
        nmcli "${nmobj}" wifi on
        ;;
    esac
    ;;
esac
```

## References

[https://askubuntu.com/questions/112968/automatically-disable-wifi-wireless-when-wired#112969](https://askubuntu.com/questions/112968/automatically-disable-wifi-wireless-when-wired#112969)
