---
pubDatetime: 2024-01-08T09:04:22Z
title: "WD My Passport and LUKS"
tags:
  - "Linux"
  - "luks"
  - "Security"
heroImage: "/blog-media/2018/10/computer-code.jpg"
description: "I found a 4TB WD My Passport drive, and thought I'd see if I could put it to use on Linux. I'm not going to even try using the built-in AES256 encryption,"
---
I found a 4TB WD My Passport drive, and thought I'd see if I could put it to use on Linux. I'm not going to even try using the built-in AES256 encryption, and will be using LUKS.

My initial finding were that it would not mount an encrypted partition. It complained about being unable to activate the disk with an error `udisks-error-quark`. No idea what that meant.

I'd created the partitions on the disk using the Gnome Disks application, and chosen to encrypt using LUKS. That clearly didn't work, so I changed to using `fdisk` and the command line. It returned the same results.

Looking in `dmesg` I found this:

```
device-mapper: table: 254:0: start=32774 not aligned to h/w logical block size 4096 of sdb1
```

I finally tried `parted` and that complained with a similar message saying the start was not aligned. `parted` even has an `align-check` that I used to confirm it. Next I deleted the partition in `parted` using `rm 1` and recreated it, specifying the start at 1M and the end at 4001GB. Success. I can now encrypt the volume and mount it correctly.
