---
pubDatetime: 2023-01-13T14:16:17Z
modDatetime: 2023-01-13T14:16:44Z
title: "Speed Up tar with pigz"
tags:
  - "Linux"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "The usual tar cvzf ... uses box standard gzip. A parallel implementation of gzip for modern multi-processor, multi-core machines https://zlib.net/pigz/ Swi"
---
The usual `tar cvzf ...` uses box standard gzip.

> A parallel implementation of gzip for modern multi-processor, multi-core machines
>
> https://zlib.net/pigz/

Switch to using pigz for using all your cores

```
tar -c --use-compress-program=pigz -vf mytarfile.tgz /mysource
```
