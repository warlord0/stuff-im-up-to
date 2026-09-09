---
pubDatetime: 2023-02-24T09:03:42Z
title: "IP Address RegEx"
tags:
  - "Linux"
  - "Aside"
description: "Searching for IP addresses in a file or files: grep -oE '((1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\\.){3}(1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])' file"
---
Searching for IP addresses in a file or files:

```
grep -oE '((1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])\.){3}(1?[0-9][0-9]?|2[0-4][0-9]|25[0-5])' file
```
