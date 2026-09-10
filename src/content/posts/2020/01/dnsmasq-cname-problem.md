---
pubDatetime: 2020-01-13T18:29:34Z
modDatetime: 2020-01-14T08:39:29Z
title: "dnsmasq CNAME problem"
tags:
  - "dhcp"
  - "dns"
  - "dnsmasq"
  - "Linux"
  - "Networking"
heroImage: "/blog-media/2020/01/dnsmasq.png"
description: "Today a chunk of the network CNAME resolutions failed. We looked at the config file /etc/dsmasq.d/dns-cname.conf and everything looked in order. A test of"
---
Today a chunk of the network CNAME resolutions failed. We looked at the config file `/etc/dsmasq.d/dns-cname.conf` and everything looked in order. A test of the config using `dnsmasq --test` passed ok too. So what's going on?

Burning time commenting out entries in the config files got us nowhere. a resolution to some CNAME entries worked, but others didn't and they were in the same file, same format and not failing in any particular order.

A quick script to run through the file and test the resolution of each entry was built and the results showed some success and a lot of failures.:

```
$ for i in `cat dns-cname.conf |grep cname |cut -f 2 -d '=' |cut -f 1 -d ','` ; do echo Checking: $i; dig $i |grep CNAME ; done |less
```

Eventually a reboot of one of the hosts the CNAME pointed at would bring up the resolution. This seemed strange and proved that the issue wasn't related to any file misconfiguration. The affected hosts are all reserved DHCP clients, each given an address from the same dnsmasq instances DHCP service.

Looking in the `/var/lib/mics/dnsmasq.leases` file showed none of the failing/missing CNAME servers appeared in there. As they reboot they'd take out a new lease and the CNAME resolution would then work for that host.

Something bad was going on not with DNS, but with the relationship between DHCP leases and DNS resolution. On each missing CNAME host a release and renew of the DHCP address updated the leases file and in turn brought up the DNS CNAME resolution.

```
$ cat /var/lib/misc/dnsmasq.leases |sort
```

> It appears dnsmasq does not bring up a CNAME for a dynamic client unless the DHCP lease has been registered. We could wait the 12 hours for the client to refresh it's lease, or force a refresh on each client.

*Dnsmasq version 2.55 Copyright (c) 2000-2010 Simon Kelley*
