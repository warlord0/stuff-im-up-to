---
pubDatetime: 2026-01-20T11:08:30+00:00
title: "Improve Your Build Times"
tags:
  - "Linux"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "When installing a package, even from the package manager, the default compilation flags are to use 2-CPU cores only. This might be fine for your setup, but I recently ran into an issue where qt5-webengine was taking an entire day to build on my laptop. Make the change by setting your MAKEFLAGS to match your…"
---
When installing a package, even from the package manager, the default compilation flags are to use 2-CPU cores only. This might be fine for your setup, but I recently ran into an issue where `qt5-webengine` was taking an entire day to build on my laptop.

Make the change by setting your `MAKEFLAGS` to match your processor count, or at least close.

Copy `makepkg.conf` into your home directory as `.makepkg.conf` and edit accordingly (`MAKEFLAGS="--jobs=$(nproc)"` to use all the cores) I have 16 cores available to me, but want to have some available beyond building stuff. So I set `MAKEFLAGS="--jobs=12"` or `-j12` in shorthand.

`cp /etc/makepkg.conf ~/.makepkg.conf`

As `pamac`/`pacman` run as root you may want to edit the `/etc/makepkg.conf` directly.

## References

<https://wiki.archlinux.org/title/Makepkg#Improving_build_times>
