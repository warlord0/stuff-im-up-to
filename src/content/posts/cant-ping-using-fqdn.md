---
pubDatetime: 2017-07-21T08:36:12Z
title: "Can't ping using FQDN"
tags:
  - "dns"
  - "Linux"
description: "I've run across this a few times now. It seems every time I do a big Linux upgrade I lose the ability to connect to an internal server using its FQDN. I ca"
---
I've run across this a few times now. It seems every time I do a big Linux upgrade I lose the ability to connect to an internal server using its FQDN. I can ping the short name, I can do a DNS resolution of the FQDN, but I just can't connect to it using RDP and can't ping it using its FQDN. This is something to do with the domain name being `.local` and conflicting with the MDNS service. Not sure exactly what but it's an easy fix. All you need do is adjust the order of the name service lookups in the `/etc/nsswitch.conf` file and make sure `dns` comes before the `mdns` entry.

    $ sudo vi /etc/nsswtch.conf
    ...
    hosts: files myhostname dns mdns4_minimal [NOTFOUND=return]

Initially I found the `dns` was last in the list so just move it in front of the `mdns4_minimal` entry and you're set.
