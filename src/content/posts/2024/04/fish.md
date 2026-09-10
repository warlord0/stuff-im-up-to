---
pubDatetime: 2024-04-19T18:14:16Z
modDatetime: 2024-04-23T10:35:26Z
title: "fish"
tags:
  - "fish"
  - "Linux"
heroImage: "/blog-media/2024/04/fish.png"
description: "I've been using the excellent zsh and antigen for a while, but one thing really annoyed me. The autocomplete often showed duplicate characters or mangled t"
---
I've been using the excellent zsh and antigen for a while, but one thing really annoyed me. The autocomplete often showed duplicate characters or mangled the line somehow. I thought I'd have a look at fish shell.

In zsh I like my simple `ay` theme. Shows me where I am and what my git status is, turns out I can use the same/equivalent theme in fish. Even more fun it has an extension called "[Oh My Fish](https://github.com/oh-my-fish/oh-my-fish)" paying homage, or tongue in cheek, to "Oh My Zsh". Install fish and Oh My Fish.

```
pamac install fish
curl https://raw.githubusercontent.com/oh-my-fish/oh-my-fish/master/bin/install | fish
```

Get Oh My Fish to install the `ays` theme.

```
omf install ays
```

What am I missing? Docker aliases - I make big use of `dcupd`, `dclf`, etc. How do I get my aliases into fish? There doesn't appear to be a docker/docker compose plugin like there is in Oh My Zsh, but aliases can be added to your fish config in `~/.config/fish/fish.config` just like your `~/.zshrc`. But I then discovered `abbr`. A nice feature of fish that acts like aliases, but expands them out as you type, eg. `dclf` becomes the full `docker compose logs -f` as soon as you hit the spacebar.

This is my `fish.config`, a few docker aliases, with exa, bat and nvim.

```
if status is-interactive
    # Commands to run in interactive sessions can go here
    abbr -a -- dcps 'docker compose ps'
    abbr -a -- dclf 'docker compose logs -f'
    abbr -a -- dcup 'docker compose up'
    abbr -a -- dcupd 'docker compose up -d'
    abbr -a -- dcdn 'docker compose down'
    abbr -a -- dcl 'docker compose logs'
    abbr -a -- ls 'exa'
    abbr -a -- cat 'bat -p'
    abbr -a -- vi nvim
    abbr -a -- vim nvim
end
```

Remove the welcome greeting with:

```
set -U fish_greeting
```

## References

[zsh antigen](https://warlord0blog.wordpress.com/2021/03/03/zsh-antigen/)
