---
pubDatetime: 2023-08-07T17:27:20Z
modDatetime: 2023-08-07T17:28:18Z
title: "Manjaro Failed Updates"
tags:
  - "Linux"
  - "manjaro"
  - "Security"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "Finally, got a power supply for my laptop. Been turned off for quite a while. When I powered it on and tried to update it: error: GPGME error: No data erro"
---
Finally, got a power supply for my laptop. Been turned off for quite a while. When I powered it on and tried to update it:

```
error: GPGME error: No data
error: failed to synchronize all databases (invalid or corrupted database (PGP signature))
```

Fixed using:

```
$ sudo rm -R /var/lib/pacman/sync
```

Then retry the update, and it re-downloads all the keys.
