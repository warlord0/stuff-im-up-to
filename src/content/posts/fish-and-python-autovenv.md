---
pubDatetime: 2026-07-14T10:26:20+00:00
title: "Fish and Python autovenv"
tags:
  - "Linux"
  - "Fish"
  - "Python"
heroImage: "/blog-media/2024/04/fish.png"
description: "I used a plugin for a while to automatically activate and deactivate my Python environments when I change directory. It looks like that's been discontinued. (Fish and autovenv) I took it upon myself to roll my own: ~/.config/fish/conf.d/autovenv.fish function python_venv --on-variable PWD set -l tree (pwd) while test \"$tree\" != / for myvenv in \"$tree/.venv\"…"
---
I used a plugin for a while to automatically activate and deactivate my Python environments when I change directory. It looks like that’s been discontinued. ([Fish and autovenv](https://warlord0blog.wordpress.com/2025/06/02/fish-and-autovenv/))

I took it upon myself to roll my own:

### ~/.config/fish/conf.d/autovenv.fish

    function python_venv --on-variable PWD
        set -l tree (pwd)

        while test "$tree" != /
            for myvenv in "$tree/.venv" "$tree/venv"
                if test -d "$myvenv"
                    if test "$PATH[1]" != "$myvenv/bin"
                        if functions -q deactivate
                            deactivate
                        end
                        source "$myvenv/bin/activate.fish"
                    end
                    return
                end
            end

            set tree (dirname "$tree")
        end

        if functions -q deactivate
            deactivate
        end
    end

If it finds a folder called `venv` or `.venv` in the current or parent folder it will activate it.
