---
pubDatetime: 2018-11-05T14:58:54Z
modDatetime: 2018-11-07T12:43:05Z
title: "RADIUS Testing"
tags:
  - "Linux"
  - "Networking"
  - "radius"
  - "Security"
description: "We have a need to authenticate a couple of devices via our Wifi access points with a RADIUS server. Right now I wanted to test things out using a MAC addre"
---
We have a need to authenticate a couple of devices via our Wifi access points with a RADIUS server. Right now I wanted to test things out using a MAC address authentication process. But for some reason we can't get it working on the AP's.

### How do I test the RADIUS authentication policies are correct?

I recall using a RADCHECK program in Windows many years ago and figured Linux would probably have something similar. Sure enough a quick search means I can install `freeradius-utils` which includes `radtest` and `radclient`. I needed to pass a number of RADIUS attributes and values with my test call and this is how I did it:

    $ cat << EOF | radclient -x [radisuserver] auth [supersecretkey]
    User-Name = 6894244B56EB
    User-Password = 6894244B56EB
    NAS-Port-Type = 19
    NAS-Port = 0
    Calling-Station-Id = SSID
    EOF

This spoofed an auth call to the RADIUS server using the specified MAC address as user name and password and pretended the call was from a `NAS-Port-Type` of `Wireless - 802.1x` (19). I got the table of values from here: [https://www.juniper.net/documentation/en_US/junos/topics/concept/subscriber-management-nas-port-type-overview.html](https://www.juniper.net/documentation/en_US/junos/topics/concept/subscriber-management-nas-port-type-overview.html)

| Statement Option | NAS-Port-Type Value | Description |
|:---|:---|:---|
| `value` | 0–65535 | Number that indicates either the IANA-assigned value for the RADIUS port type or a custom number-to-port type defined by the user |
| adsl-cap | 12 | Asymmetric DSL, carrierless amplitude phase (CAP) modulation |
| adsl-dmt | 13 | Asymmetric DSL, discrete multitone (DMT) |
| async | 0 | Asynchronous |
| cable | 17 | Cable |
| ethernet | 15 | Ethernet |
| fddi | 21 | Fiber Distributed Data Interface |
| g3-fax | 10 | G.3 Fax |
| hdlc-clear-channel | 7 | HDLC Clear Channel |
| iapp | 25 | Inter-Access Point Protocol (IAPP) |
| idsl | 14 | ISDN DSL |
| isdn-sync | 2 | ISDN Synchronous |
| isdn-v110 | 4 | ISDN Async V.110 |
| isdn-v120 | 3 | ISDN Async V.120 |
| piafs | 6 | Personal Handyphone System (PHS) Internet Access Forum Standard |
| sdsl | 11 | Symmetric DSL |
| sync | 1 | Synchronous |
| token-ring | 20 | Token Ring |
| virtual | 5 | Virtual |
| wireless | 18 | Other wireless |
| wireless-1x-ev | 24 | Wireless 1xEV |
| wireless-cdma2000 | 22 | Wireless code division multiple access (CDMA) 2000 |
| **wireless-ieee80211** | **19** | **Wireless 802.11** |
| wireless-umts | 23 | Wireless universal mobile telecommunications system (UMTS) |
| x25 | 8 | X.25 |
| x75 | 9 | X.75 |
| xdsl | 16 | DSL of unknown type |
