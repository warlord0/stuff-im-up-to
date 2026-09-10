---
pubDatetime: 2020-08-08T10:20:13Z
title: "Raspbian & Realtek 8192eu Wifi - Revisited"
tags:
  - "Linux"
  - "raspberry pi"
  - "wifi"
heroImage: "/blog-media/2016/09/raspberry_pi_wallpaper_hd_1080p_by_tpbarratt-d4suve2.jpg"
description: "STOP READING NOW IF YOU CAN'T HANDLE DISAPPOINTMENT. It's been a while since I originally wrote about the Raspbian & Realtek 8192eu WiFi USB Wifi adapter a"
---
**STOP READING NOW IF YOU CAN'T HANDLE DISAPPOINTMENT.**

It's been a while since I originally wrote about the [Raspbian & Realtek 8192eu WiFi](https://warlord0blog.wordpress.com/2017/02/19/raspbian-realtek-8192eu-wifi/) USB Wifi adapter and just recently I wanted to build something from some old Pi's I had knocking around. I needed Wifi so went to install the adapter I have using my notes. They no longer apply. Seems the creator of the previous builds has retired them and a new method is needed.

This lead me here: [https://github.com/Mange/rtl8192eu-linux-driver](https://github.com/Mange/rtl8192eu-linux-driver)

Only trouble is with my kernel 4.19 it wasn't able to get the headers necessary to build it.

Let's really upgrade things. It's an old Pi B+ I'm using, no wifi - hence the need for a USB dongle. Let's use rpi-update:

```
sudo rpi-update
```

This took it from:

```
Linux raspberrypi 4.19.118+ #1311 Mon Apr 27 14:16:15 BST 2020 armv6l
```

to:

```
$ uname -a
Linux raspberrypi 5.4.51+ #1332 Tue Aug 4 18:28:38 BST 2020 armv6l GNU/Linux
```

Now when I follow the setup from github, it starts making:

\$ sudo dkms install rtl8192eu/1.0

Kernel preparation unnecessary for this kernel. Skipping…

```
Building module:
cleaning build area…
'make' all KVER=5.4.51+………………………………………………………………………………………………………………………….
```

... Some considerable time later.

```
cleaning build area…
DKMS: build completed.
8192eu.ko:
Running module version sanity check.
Original module
No original module exists within this kernel
Installation
Installing to /lib/modules/5.4.51+/kernel/drivers/net/wireless//
depmod…..
Warning: Unable to find an initial ram disk that I know how to handle.
Will not try to make an initrd.
DKMS: install completed.
```

This is where it all came to a crashing end for me.

```
modprobe: ERROR: could not insert '8192eu': Exec format error
```

The module still fails to load and there are complaints in dmesg etc. looking like:

```
8192eu: disagrees about version of symbol module_layout
```

```
could not insert module 8192eu.mod: Invalid module format
```

So I've given up for now. I've seen others spend hours messing with kernel version mismatches and may need to get my head around that some more, but for now I just plugged in another working USB Wifi adapter.
