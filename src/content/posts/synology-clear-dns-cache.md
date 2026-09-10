---
pubDatetime: 2021-05-18T16:05:28Z
title: "Synology Clear DNS Cache"
tags:
  - "Linux"
  - "synology"
heroImage: "/blog-media/2017/04/synology-partner.png"
description: "It’s really simple and after googling I couldn’t find a straight answer. Login via SSH sudo /var/packages/DNSServer/target/script/flushcache.sh References"
---
It’s really simple and after googling I couldn’t find a straight answer.

Login via SSH

```
sudo /var/packages/DNSServer/target/script/flushcache.sh
```

## References

https://geektank.net/uncategorized/clearing-dns-chace-on-synology/
