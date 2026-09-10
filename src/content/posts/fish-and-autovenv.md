---
pubDatetime: 2025-06-02T15:08:49+00:00
title: "Fish and autovenv"
tags:
  - "Linux"
  - "Fish"
  - "Pyhon"
heroImage: "/blog-media/2024/04/fish.png"
description: "DEPRECATED: See Fish and Python autovenv Zsh has a nice plugin to automate the activation of a Python virtual environment when you change into a directory that has one. I went looking for a fish equivalent. After trying a few, this was the only one that worked for me. Use fisher to install it. https://github.com/aohorodnyk/fish-autovenv fisher…"
---
> **DEPRECATED**: See [Fish and Python autovenv](https://warlord0blog.wordpress.com/2026/07/14/fish-and-python-autovenv/)

Zsh has a nice plugin to automate the activation of a Python virtual environment when you change into a directory that has one. I went looking for a `fish` equivalent.

After trying a few, this was the only one that worked for me. Use `fisher` to install it.

[https://github.com/aohorodnyk/fish-autovenv](https://github.com/aohorodnyk/fish-autovenv)

    fisher install aohorodnyk/fish-autovenv

Example

    & warlord @ warlord-xps in ~
    ~ cd ~/scripts/tracker-api-v1/
    Activated Virtual Environment (tracker-api-v1)
    (.venv) 
    & warlord @ warlord-xps in ~/scripts/tracker-api-v1 (main ✚4)

## References

[https://github.com/aohorodnyk/fish-autovenv](https://github.com/aohorodnyk/fish-autovenv)

[https://aohorodnyk.com/post/2023-06-10-fish-autovenv/](https://aohorodnyk.com/post/2023-06-10-fish-autovenv/)
