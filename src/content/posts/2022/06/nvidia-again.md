---
pubDatetime: 2022-06-15T17:22:41Z
modDatetime: 2022-06-15T17:23:25Z
title: "Nvidia... again!"
tags:
  - "Linux"
  - "manjaro"
  - "nvidia"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "Yep, whilst applying some updates to Manjaro, my screen goes blank and the system dies. This time the updates are with 5.17, and it forced me to reboot and"
---
Yep, whilst applying some updates to Manjaro, my screen goes blank and the system dies.

This time the updates are with 5.17, and it forced me to reboot and install 5.18. This was a little tricky as I could not boot 5.17 at all, and had to resort to 5.16 - glad I kept that. But because 5.16 is not supported by the Nvidia drivers I had to `ssh` onto my system remotely, and manually install `linux518-nvidia` to get it to build the kernel.

## References

[Nvidia Nightmare Returns](https://warlord0blog.wordpress.com/2022/01/25/nvidia-nightmare-returns/)

[Manjaro Gnome Failure After Update](https://warlord0blog.wordpress.com/2021/05/19/manjaro-gnome-failure-after-update/)
