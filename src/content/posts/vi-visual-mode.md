---
pubDatetime: 2018-02-15T08:09:05Z
modDatetime: 2018-02-15T08:14:23Z
title: "vi - Visual Mode"
tags:
  - "debian"
  - "Linux"
description: "I'm sure when using a mouse in a text terminal the visual mode of vi/vim is useful, but I can never figure it out. In fact it prevents me from copying from"
---
I'm sure when using a mouse in a text terminal the visual mode of vi/vim is useful, but I can never figure it out. In fact it prevents me from copying from a vi terminal in a window. To temporarily disable mouse visual mode in a window, so you can copy your text it's as simple as hold the `SHIFT` key down whilst selecting text with your mouse. Or you can disable it in that vi session by typing `:set mouse-=a` To permanently disable visual mode in your session create or add the following to your `~/.vimrc` file

    set mouse-=a

If you need to do this for whilst using vi/vim under `sudo`, you'll have to add the above into `/root/.vimrc`.
