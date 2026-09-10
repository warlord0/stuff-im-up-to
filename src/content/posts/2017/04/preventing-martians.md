---
pubDatetime: 2017-04-04T09:06:07Z
modDatetime: 2017-04-04T09:09:21Z
title: "Preventing Martians"
tags:
  - "Networking"
  - "Security"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "In the process of changing firewalls and routers around we encountered the Juniper detecting what it suspected were malicious MAC address changes that no longer match the IP address it last used. Which is understandable as we're giving the same IP address to new hardware."
---
In the process of changing firewalls and routers around we encountered the Juniper detecting what it suspected were malicious MAC address changes that no longer match the IP address it last used. Which is understandable as we're giving the same IP address to new hardware. This MAC mismatch error triggers some Martian alerts, which results in the IP addresses for the new devices becoming unroutable. To try and prevent this we should try clearing down the IP ARP cache tables for various devices.

### Juniper (ScreenOS)

    -> clear arp [192.168.0.254]

or

    -> clear arp all

### Extreme Switches (XOS)

    # clear iparp [192.168.0.254]

or

    # clear iparp vlan [TRUST]

> Martian addresses are host or network addresses about which all routing information is ignored. When received by the routing device, these routes are ignored. They commonly are sent by improperly configured systems on the network and have destination addresses that are obviously invalid.
