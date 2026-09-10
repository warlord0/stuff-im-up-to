---
pubDatetime: 2023-11-13T18:56:18Z
title: "More Happy Desktop"
tags:
  - "gnome"
  - "Linux"
heroImage: "/blog-media/2019/07/gnomelogohorizontal.svg_.png"
description: "It's nice getting your desktop setup just the way you want it. The right mix of icons, cursors, themes, and wallpapers. Now there's a handy tool called gdm"
---
It's nice getting your desktop setup just the way you want it. The right mix of icons, cursors, themes, and wallpapers.

Now there's a handy tool called `gdm-tools` that lets you sort out the style of the Gnome gdm login screen - without the need for advanced brain surgery and lots of file jiggery-pokery. With a few simple commands, I can get the login background and theme to match my running desktop theme. No more boring flat grey login.

```
pamac install gdm-tools

set-gdm-theme list
set-gdm-theme set <theme-name>
set-gdm-theme set Qogir-dark
set-gdm-theme set -b /usr/share/backgrounds/purple.png

set-gdm-theme backup update
set-gdm-theme backup restore

set-gdm-theme reset

set-gdm-theme -h
gnomeconf2gdm -h
man set-gdm-theme
```

## References

[https://www.linuxuprising.com/2021/05/how-to-change-gdm3-login-screen-greeter.html](https://www.linuxuprising.com/2021/05/how-to-change-gdm3-login-screen-greeter.html)
