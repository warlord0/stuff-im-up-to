---
pubDatetime: 2019-07-27T16:25:56Z
modDatetime: 2020-01-14T09:37:13Z
title: "Ignore Comments in Files"
tags:
  - "Linux"
  - "Windows"
description: "A very handy grep that you can use to cat your files without the hash (#) comments: $ grep '^[^#]' /etc/systemd/timesyncd.conf Produces only the lines that"
---
A very handy grep that you can use to cat your files without the hash (#) comments:

```
$ grep '^[^#]' /etc/systemd/timesyncd.conf
```

Produces only the lines that aren't comments, eg:

```
[Time]
NTP=192.168.1.55 192.168.1.108
FallbackNTP=0.debian.pool.ntp.org 1.debian.pool.ntp.org 2.debian.pool.ntp.org 3.debian.pool.ntp.org
```

Extending this to exclude lines where the hash isn't the first character and have blanks before a comment, eg.

```
$ grep '^[[:blank:]]*[^[:blank:]#;]' /usr/share/postgresql/postgresql.conf
```

Shows only the active parts of the config, which in the case of postreSQL may not be many lines from a highly commented file.
