---
pubDatetime: 2019-07-27T16:38:31Z
modDatetime: 2021-10-22T15:57:01Z
title: "DNSSEC Validation Failed"
tags:
  - "Linux"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "Looking at my virtual dev system I noticed the time is off. I checked the timesyncd.conf and restarted timesyncd and saw lots of similar errors to this in"
---
Looking at my virtual dev system I noticed the time is off. I checked the `timesyncd.conf` and restarted `timesyncd` and saw lots of similar errors to this in my syslog:

```
Jul 25 23:18:59 buster systemd[1]: Started Network Time Synchronization.
Jul 25 23:18:59 buster systemd-resolved[357]: DNSSEC validation failed for question org IN DS: signature-expired
Jul 25 23:18:59 buster systemd-resolved[357]: DNSSEC validation failed for question org IN DNSKEY: signature-expired
Jul 25 23:18:59 buster systemd-resolved[357]: DNSSEC validation failed for question ntp.org IN DS: signature-expired
Jul 25 23:18:59 buster systemd-resolved[357]: DNSSEC validation failed for question ntp.org IN SOA: signature-expired
```

Initially I thought something is wrong with my DNS resolver. I then edited `/etc/systemd/resolved.conf` to change the `DNSSEC` setting by uncommenting it:

```
[Resolve]
#DNS=
#FallbackDNS=
#Domains=
#LLMNR=yes
#MulticastDNS=yes
DNSSEC=allow-downgrade
#DNSOverTLS=no
#Cache=yes
#DNSStubListener=yes
#ReadEtcHosts=yes
```

Then a restart and my time is all synced.

> But then I thought about it some more. The DNSSEC was probably failing because my system time was significantly wrong by several hours. So the signature probably isn't valid. Probably all I needed to do was set the time manually before it would sync. But a reboot sorted it and I have reset my DNSSEC back to being commented out.
