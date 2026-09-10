---
pubDatetime: 2021-05-17T09:27:00Z
modDatetime: 2022-01-07T13:46:23Z
title: "Wayland Remote Desktop"
tags:
  - "gnome"
  - "Linux"
heroImage: "/blog-media/2019/07/gnomelogohorizontal.svg_.png"
description: "It's been a long time since Wayland became a default in many distros Gnome environment. The trouble with this has been the lack of remote desktop functiona"
---
It's been a long time since Wayland became a default in many distros Gnome environment. The trouble with this has been the lack of remote desktop functionality, until now.

With the advent of pipewire, remote desktop support is now possible, with a few caveats.

Install vino - A VNC server for the GNOME desktop.

```
sudo pacman -S vino
```

You may also have to install some other packages like `libvncserver` - this page may help if you are missing dependencies.

[https://archlinux.org/packages/extra/x86_64/gnome-remote-desktop/](https://archlinux.org/packages/extra/x86_64/gnome-remote-desktop/)

In order for VNC to connection, you need to turn off encryption. I also want to get connected to a remote session where there is no user

Firstly install `gone-remote-desktop`. This will then appear under the sharing options in settings. You'll notice the expected options for password. But there is no option here to set it as an unencrypted password. For that we need to use the `dconf-editor` which you may have to install.

Within the `dconf-editor` navigate to `/ org / gnome / desktop / remote-access` and deselect the options `notify-on-connect`, `prompt-enabled` and `require-encryption`. Now go back to settings and sharing and disable and enable the desktop sharing to have it take affect.

Alternatively use `gsettings` to set the key values.

```
gsettings set org.gnome.Vino prompt-enabled false
gsettings set org.gnome.Vino notify-on-connect false
gsettings set org.gnome.Vino require-encryption false
```

## References

[https://wiki.gnome.org/Projects/Mutter/RemoteDesktop](https://wiki.gnome.org/Projects/Mutter/RemoteDesktop)
