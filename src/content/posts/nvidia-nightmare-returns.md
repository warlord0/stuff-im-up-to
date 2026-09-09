---
pubDatetime: 2022-01-25T20:18:38Z
modDatetime: 2022-01-25T22:27:24Z
title: "Nvidia Nightmare Returns"
tags:
  - "Linux"
  - "manjaro"
  - "nvidia"
description: "After an upgrade on Manjaro, I got no graphical environment. Looking in the logs it tells me something is going on with nvidia: $ sudo journalctl -b ... Ja"
---
After an upgrade on Manjaro, I got no graphical environment. Looking in the logs it tells me something is going on with nvidia:

```
$ sudo journalctl -b
...
Jan 25 19:11:53 detective systemd-modules-load[345]: Failed to find module 'nvidia'
Jan 25 19:11:53 detective systemd-modules-load[345]: Failed to find module 'nvidia-drm'
Jan 25 19:11:53 detective systemd-modules-load[345]: Failed to find module 'nvidia-uvm'
```

Then trying the reinstall at a command prompt:

```
sudo mhwd -f -i pci video-nvidia
```

It complained about all kinds of kernel drivers not being found `linux510-nvidia`, `linux513-nvidia` and not being able to uninstall because of dependencies for `psensor`, `nvidia-utils` and `libxnvctrl`. I had to manually uninstall these, but only after I installed kernel 515rebooted and removed the old kernels. Then reinstall.

```
sudo mhwd-kernel -i linux515
sudo reboot
sudo mhwd-kernel -r linux513 
sudo mhwd-kernel -r linux510
sudo pacman -R psensor nvidia-utils libxnvctrl
sudo mhwd -f -i pci video-nvidia
```

In actual fact, I got graphics back after the reboot, but I figured I best tidy up.

Related to: [Manjaro Gnome Failure After Update](https://warlord0blog.wordpress.com/2021/05/19/manjaro-gnome-failure-after-update/)
