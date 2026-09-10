---
pubDatetime: 2026-07-28T18:50:51+00:00
title: "Nano’s Work Here is Done"
tags:
  - "Linux"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "You've crossed the final threshold: the moment when opening Nano feels more alien than opening Vim. And :set ff=unix removes one of those occasional reasons for reaching for something else. Add these to the mental toolkit: :set ff? \" What line endings have I got? :set ff=unix \" LF :set ff=dos \" CRLF :set list…"
---
You’ve crossed the final threshold: the moment when opening Nano feels more alien than opening Vim.

And `:set ff=unix` removes one of those occasional reasons for reaching for something else. Add these to the mental toolkit:

    :set ff?          " What line endings have I got?
    :set ff=unix      " LF
    :set ff=dos       " CRLF
    :set list         " Show invisible characters
    :set nolist

Then the inevitable emergency:

    :%s/\r$//

And, of course:

    :wq

Which now has the considerable advantage of **not becoming part of the file**.

Nano can go back where it belongs: installed on a machine solely so you can accidentally launch it and mutter *“for f\*\*k’s sake”* before exiting.

On your Linux boxes set it in the shell environment:

```
export EDITOR=vim
export VISUAL=vim
export SUDO_EDITOR=vim
```

Put those in `~/.bashrc` or `~/.zshrc`, depending on your shell, then reload:

```
source ~/.bashrc
```

If **nvim is actually your preferred comfort zone**, I’d use that instead:

```
export EDITOR=nvim
export VISUAL=nvim
export SUDO_EDITOR=nvim
```

`EDITOR` is the traditional variable used by things such as `crontab -e`. `VISUAL` is honoured by various programs as the preferred full-screen editor and often takes precedence over `EDITOR`.

For Git, I also like making it explicit rather than relying on environment inheritance:

```
git config --global core.editor "nvim"
```

And on Debian/Ubuntu there’s also the system alternatives mechanism:

```
sudo update-alternatives --config editor
```

Choose Vim/Neovim and things using `/usr/bin/editor` will follow suit.

So my setup would essentially be:

```
export EDITOR=nvim
export VISUAL=nvim
export SUDO_EDITOR=nvim
git config --global core.editor "nvim"
```

Then `crontab -e`, `git commit`, `systemctl edit`, etc. stop unexpectedly dropping you into Nano.

## Why the `SUDO_EDITOR` ?

There is also a security reason sudo doesn’t blindly preserve EDITOR: an editor can execute arbitrary commands, so allowing a user to influence which executable a privileged command launches matters. On your own machines where you’re already in sudoers, that’s mostly a policy decision rather than a revelation.
