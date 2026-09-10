---
pubDatetime: 2021-01-19T06:28:00Z
modDatetime: 2021-01-18T14:36:37Z
title: "Nautilus NFS Browser"
tags:
  - "gnome"
  - "Linux"
  - "manjaro"
  - "nfs"
heroImage: "/blog-media/2019/07/gnomelogohorizontal.svg_.png"
description: "When using Gnome Nautilus I'm not seeing any support for nfs shares. This means I can't use it to browse my NAS. I trawled the net for some time, being lea"
---
When using Gnome Nautilus I'm not seeing any support for nfs shares. This means I can't use it to browse my NAS.

I trawled the net for some time, being lead around various issues where Nautilus would crash whilst browsing nfs, but my Nautilus just doesn't have nfs listed as a protocol I can use.

When I start typing `nfs://` into the browser the input just goes red. If I click on the help icon it shows available protocols for AppleTalk, ftp, smb, ssh and webdav - but no nfs.

I'm missing one package, `gvfs-nfs`

```
sudo pacman -S gvfs-nfs
```
