---
pubDatetime: 2021-01-17T14:03:42Z
modDatetime: 2021-02-11T21:54:19Z
title: "Gnome Background Colours"
tags:
  - "gnome"
  - "Linux"
heroImage: "/blog-media/2019/07/gnomelogohorizontal.svg_.png"
description: "I rarely use pictures on my background wallpapers and like to use simple colors. There doesn't appear to be an option in gnome-tweaks to allow me to attain"
---
I rarely use pictures on my background wallpapers and like to use simple colors. There doesn't appear to be an option in gnome-tweaks to allow me to attain this. It needs to be done from the command line.

```
gsettings set org.gnome.desktop.background picture-options 'none'
gsettings set org.gnome.desktop.background primary-color '#009999'
gsettings set org.gnome.desktop.background color-shading-type 'solid'
```

Other options for graduated tints:

```
gsettings set org.gnome.desktop.background picture-options 'none'
gsettings set org.gnome.desktop.background primary-color '#000000'
gsettings set org.gnome.desktop.background secondary-color '#009999'
gsettings set org.gnome.desktop.background color-shading-type 'vertical'
```
