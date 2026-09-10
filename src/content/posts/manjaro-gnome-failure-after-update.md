---
pubDatetime: 2021-05-19T17:15:20Z
modDatetime: 2021-05-19T21:06:12Z
title: "Manjaro Gnome Failure After Update"
tags:
  - "gnome"
  - "Linux"
  - "manjaro"
  - "nvidia"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "Today I took the rolling updates and as it was updating I got an error message that I didn't understand. Warning: installing nvidia-utils (460.80-1) breaks"
---
Today I took the rolling updates and as it was updating I got an error message that I didn't understand.

```
Warning: installing nvidia-utils (460.80-1) breaks dependency 'nvidia-utils=460.73.01' required by linux59-nvidia
Add linux59-nvidia to remove
```

I sensed trouble ahead and sure enough after a reboot I get no GDM logon.

I was able to CTRL+ALT+F2 to get into a terminal session and a brief trawl of `journalctl -b` told me that all was not well with the Nvidia drivers. I tried a re installation based on my current 5.9 kernel with no success.

To resolve it I moved forward into kernel 5.10 and installed the `linux510-nvidia` module:

```
sudo mhwd-kernel -li
sudo mhwd-kernel -i linux510
sudo pacman -S linux510-nvidia
sudo reboot
```

Now I'm back in Gnome... but was this the right solution?
