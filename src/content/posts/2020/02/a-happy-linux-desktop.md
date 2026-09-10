---
pubDatetime: 2020-02-02T10:53:00Z
modDatetime: 2020-02-02T16:12:27Z
title: "A Happy Linux Desktop"
tags:
  - "gnome"
  - "Linux"
heroImage: "/blog-media/2020/01/gnome_qogir.png"
description: "We've all been through lots of window managers from Gnome, LXDE, Cinnamon etc. but I think I've finally come up with a pretty desktop environment that I'm"
---
We've all been through lots of window managers from Gnome, LXDE, Cinnamon etc. but I think I've finally come up with a pretty desktop environment that I'm happy with.

Debian or Ubuntu with Gnome shell and some shell extensions, themes and icons.

First off add the `gnome-shell-extensions` and `gnome-tweaks` packages. You may have to restart or logout to get the extension and tweeks to work together. You'll need to enable the extension for User Themes so you can choose themes under "Appearance"

```
$ sudo apt install gnome-shell-extensions gnome-tweaks
```

Then go and download the [Qogir GTK3 theme](https://www.gnome-look.org/p/1230631/) from [gnome-look.org](https://www.gnome-look.org/).

Now we want some Suru++ icons. I spent a while being lead around making and building, then gave up and used a git clone from [https://github.com/gusbemacbe/suru-plus/](https://github.com/gusbemacbe/suru-plus/) instead.

```
$ git clone https://github.com/gusbemacbe/suru-plus.git
$ cd suru-plus
$ ./install.sh
```

Call up Gnome tweaks and set the theme/shell to Qogir and your icons to Suru++.
