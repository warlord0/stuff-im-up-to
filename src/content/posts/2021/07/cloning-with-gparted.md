---
pubDatetime: 2021-07-30T13:25:17Z
modDatetime: 2021-07-30T16:54:17Z
title: "Cloning with GParted"
tags:
  - "Linux"
heroImage: "/blog-media/2021/07/gparted.png"
description: "I've not had to do this before, but today I needed to replace my SSD with a bigger SSD and would really like not to have to reinstall from scratch. GParted"
---
I've not had to do this before, but today I needed to replace my SSD with a bigger SSD and would really like not to have to reinstall from scratch. GParted to the rescue.

I fitted my new SSD on SATA1 and booted from a live GParted USB disk - [https://gparted.org/liveusb.php](https://gparted.org/liveusb.php)

- Start GParted and goto /dev/sda
- Right-click my sda1 partition and choose copy
- Switch to /dev/sdb
- Right-click the empty space and click paste
- Change the partition sizes as required and accept the settings
- Repeat for the other partitions, eg. sda2
- Apply the changes and watch as GParted copies your data

That's it!

I then powered off, pulled out my old SSD from SATA0 and moved the new one into its place. Power it on, and it's as if nothing changed. I'm up and running in minutes. The only thing left to do is set up the partitions on the empty space, as I chose not to expand the pasted sda2 partition to fill the space.
