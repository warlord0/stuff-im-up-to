---
pubDatetime: 2020-05-15T11:13:09Z
modDatetime: 2020-05-15T16:13:32Z
title: "Resetting the Root Password"
tags:
  - "Linux"
  - "Security"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "I had to go through an exercise of accessing a number of a clients servers and reset the root password. They didn't have it documented anywhere and couldn'"
---
I had to go through an exercise of accessing a number of a clients servers and reset the root password. They didn't have it documented anywhere and couldn't access any of the systems at all.

With console access it's not so difficult.

Reboot the server and at the grub screen hit 'e' to edit the defaults entry.

Find the line that loads the kernel that looks something like:

```
linux /boot/vmlinuz-4.19.0-8-amd64 root=UUID=96a721bf-d04b-435e-8904-7f8282813b07 ro cgroup_enable=memory swapaccount=1 quiet
```

and add onto it `init=/bin/bash`.

```
linux /boot/vmlinuz-4.19.0-8-amd64 root=UUID=96a721bf-d04b-435e-8904-7f8282813b07 ro cgroup_enable=memory swapaccount=1 quiet init=/bin/bash
```

Then press CTRL+X to boot the system with this temporary option. It should start pretty quickly and leave you at a bash prompt.

Remount the filesystem as read-write:

```
mount -o remount /
```

and then reset the password to whatever you like.

```
passwd
```

You will probably have to power cycle to reboot as we don't have a proper init running.

When you're back up and running you might want to check out the `/etc/ssh/sshd_config` and add in options for `PermitRootLogin yes` and `AllowPasswordAuthentication yes` so you can get to the system using ssh. Don't leave it this way. Once you're in you can then reset the users ssh `authorized_keys` to contain something you actually have access to.
