---
pubDatetime: 2021-05-14T13:41:02Z
modDatetime: 2021-05-14T13:42:14Z
title: "journalctl"
tags:
  - "Linux"
  - "Link"
description: "https://www.howtogeek.com/499623/how-to-use-journalctl-to-read-linux-system-logs/ journalctl -F _COMM journalctl -f _COMM=nslcd journalctl -S -1h journalct"
---
[https://www.howtogeek.com/499623/how-to-use-journalctl-to-read-linux-system-logs/](https://www.howtogeek.com/499623/how-to-use-journalctl-to-read-linux-system-logs/)

journalctl -F \_COMM

journalctl -f \_COMM=nslcd

journalctl -S -1h

journalctl --no-pager

journalctl -o json-pretty
