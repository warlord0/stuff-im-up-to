---
pubDatetime: 2021-04-09T16:02:46Z
title: "Forgotten root Password"
tags:
  - "Linux"
description: "Maybe not so much forgotten, but an undocumented password. It's an easy process. Boot into grub, press e on your usual boot line and then change the /boot/"
---
Maybe not so much forgotten, but an undocumented password.

It's an easy process. Boot into grub, press `e` on your usual boot line and then change the `/boot/vmlinuz...` entry so that it's read-write not read-only and add on `init=/bin/bash`. Ctrl+X to continue booting to a bash prompt. Then change the password using `passwd root`, eg.

At grub boot press `e`

Locate the `/boot/vmlinuz...` line

Change the `ro` to `rw`

Add `init=/bin/bash` to the end of it

Press `CTRL+X` to continue.

At the bash prompt:

`passwd root`

Then reboot.
