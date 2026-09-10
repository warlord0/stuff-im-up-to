---
pubDatetime: 2021-08-10T12:44:59Z
modDatetime: 2023-04-21T17:45:17Z
title: "LUKS Password Problems"
tags:
  - "Linux"
  - "Security"
heroImage: "/blog-media/2017/02/download-10-e1488295217214.jpg"
description: "After setting up a new fully encrypted system, I found that I couldn't unlock the disk encryption with the password I know I set correctly. I added a new p"
---
After setting up a new fully encrypted system, I found that I couldn't unlock the disk encryption with the password I know I set correctly.

I added a new purely lowercase simple key to the key slots and I could boot and login, but I could not use the upper/lowercase, numeric password I'd set.

I even resorted to putting the disk in another system and mounting the volume and booted from a different live Linux distro and the password I'd used worked just fine! So why doesn't it work on the system when I boot it?

Is the keyboard using the wrong codes when I type the password? When it fails to open the key slot you are left at grub rescue. If I type the password there, I can see what I type is correct. I'm not using any international characters, like `£` or `#` to confuse things. Just uppercase, lowercase and a number? Am I messing up the capitalisation, holding the shift too long? Well, it works fine when I mount it on another system.

Finally, tried using CAPS LOCK instead of shift to toggle the uppercase on/off for the capitals and, it worked!

Looks like during the initramfs unlock process, the key codes are somehow different. Using CAPS LOCK sorted it out, but it's certainly a quirky bug - let's call it added security.
