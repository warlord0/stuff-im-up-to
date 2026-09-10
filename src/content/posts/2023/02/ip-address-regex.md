---
pubDatetime: 2023-02-24T09:03:42Z
title: "IP Address RegEx"
tags:
  - "Linux"
  - "Aside"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "Searching for IP addresses in a file or files: grep -oE '((1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\\.){3}(1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])' file"
---
Searching for IP addresses in a file or files:

```
grep -oE '((1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\.){3}(1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])' file
```
