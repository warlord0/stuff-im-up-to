---
pubDatetime: 2021-08-11T10:51:00Z
modDatetime: 2021-08-10T12:55:18Z
title: "Gnome Files Sort Order"
tags:
  - "Linux"
heroImage: "/blog-media/2019/07/gnomelogohorizontal.svg_.png"
description: "When I browse to open a file, I'm always frustrated about the order in which things appear. I don't like the whole lowercase before uppercase, and having t"
---
When I browse to open a file, I'm always frustrated about the order in which things appear. I don't like the whole lowercase before uppercase, and having the scroll right down to 'D' because it's not 'd' seems pointless.

Today I poked at solving this and it's a simple fix.

Edit `/etc/locale.conf` and change `LC_COLLATE=C` to match your language, eg.

```
LANG=en_GB.UTF-8
LC_COLLATE=en_GB.UTF-8
```

Reboot and the job is done. Now I see things sorted regardless of case.
