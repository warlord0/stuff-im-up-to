---
pubDatetime: 2026-09-17T23:11:10+00:00
title: "Debian's kitty-terminfo Package"
tags:
  - "Debian"
  - "Linux"
  - "Terminal"
heroImage: "/blog-media/2026/09/kitty.webp"
heroThumb: "/blog-media/2026/09/kitty-thumb.webp"
description: "A quick follow-up to my post on fixing Kitty's missing terminfo over SSH — turns out Debian already ships a kitty-terminfo package that handles the whole problem out of the box, no manual tic incantation required…"
---

## Debian's kitty-terminfo Package

A quick follow-up to my [earlier post](/posts/xterm-kitty/) on fixing Kitty's missing terminfo when you `sudo` into another account over SSH.

I found out today, while sorting the same problem on a fresh GCP VM running Debian 13, that Debian already ships a `kitty-terminfo` package. Installing it does exactly what I was doing by hand with `infocmp` and `tic`:

```bash
sudo apt install kitty-terminfo
```

That's it — no exporting `xterm-kitty`'s definition and re-installing it system-wide yourself, no `tic -x` incantation. If you're on Debian (or a derivative with the package available), this is the fix, and the manual route in the previous post is really only needed on distros that don't package it.
