---
pubDatetime: 2023-11-21T17:32:58Z
modDatetime: 2023-11-21T18:17:26Z
title: "Making Ubuntu the Way I like It"
tags:
  - "gnome"
  - "Linux"
  - "ubuntu"
heroImage: "/blog-media/2019/07/gnomelogohorizontal.svg_.png"
description: "I'm installing a couple of Ubuntu 22.04 systems for a friend. They want a simple, friendly Linux build, or they'll go M$! My two preferred distros don't fi"
---
I'm installing a couple of Ubuntu 22.04 systems for a friend. They want a simple, friendly Linux build, or they'll go M\$! My two preferred distros don't fit the bill, Debian is tool stale for a desktop build, Manjaro is too dynamic and bleeding edge for a simple user. This leaves me wanting to give them the prettiness of Gnome, and take them away from XFCE - fitting my comfort zone, this leaves me with Ubuntu.

But Ubuntu may be simple and fairly stable, with good access to support materials for them to get into, but it just butchers a Gnome install with a Ubuntu flavour. I want a Gnome shell experience with extensions and a fully featured dash to dock.

Install some Gnome tools to bring it back to a more standard feel.

```
sudo apt install gnome-tweaks gnome-shell-extension-manager chrome-gnome-shell
```

Newer version of Ubuntu \>=23 use `gnome-browser-connector`.

Now I can visit [https://extensions.gnome.org](https://extensions.gnome.org) and install the browser extension, followed by a few of my preferred extensions like user themes and dash to dock.

Make sure you turn off the built-in Ubuntu dash, and you'll probably have to restart to get dash to dock to populate after the change.

Nothing really wrong with XFCE, but these days I think it looks quite dated, and no, I do not want to use a theme to make it look like a fruit or M\$ environment. I also find it a bit clunky to manage shortcuts and desktops, but only because Gnome is where I work. I know it's lightweight, but they've used XFCE - time to change their experience.
