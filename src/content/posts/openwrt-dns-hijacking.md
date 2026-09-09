---
pubDatetime: 2022-02-13T14:19:07Z
modDatetime: 2022-02-13T14:20:33Z
title: "OpenWrt - DNS Hijacking"
tags:
  - "Networking"
  - "openwrt"
  - "Security"
description: "For users of our LAN and Guest networks, I want to grab all their DNS calls and service them using our own resolver. This means that any call to an externa"
---
For users of our LAN and Guest networks, I want to grab all their DNS calls and service them using our own resolver. This means that any call to an external DNS server would be intercepted, and the query sent to our own systems. This is a useful security technique that means should something nasty get hold of a client and change its resolver to point at one of its malicious DNS servers, we will still capture the query and redirect it back to our known good DNS resolver.

I need to add a Port Forward for each zone I want to intercept DNS traffic on, eg.

[TABLE]

To match these settings, choose to add a port forward and fill the dialog like this:

|                     |            |
|---------------------|------------|
| Name                | dns hijack |
| Protocol            | TCP \| UDP |
| Source Zone         | guest      |
| External Port       | 53         |
| Destination Zone    | servers    |
| Internal IP Address | 10.10.4.1  |
| Internal Port       | 53         |
