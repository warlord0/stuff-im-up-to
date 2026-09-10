---
pubDatetime: 2021-05-14T13:41:02Z
modDatetime: 2021-05-14T13:42:14Z
title: "journalctl"
tags:
  - "Linux"
  - "Link"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "https://www.howtogeek.com/499623/how-to-use-journalctl-to-read-linux-system-logs/ journalctl -F _COMM journalctl -f _COMM=nslcd journalctl -S -1h journalct"
---
[https://www.howtogeek.com/499623/how-to-use-journalctl-to-read-linux-system-logs/](https://www.howtogeek.com/499623/how-to-use-journalctl-to-read-linux-system-logs/)

journalctl -F \_COMM

journalctl -f \_COMM=nslcd

journalctl -S -1h

journalctl --no-pager

journalctl -o json-pretty
