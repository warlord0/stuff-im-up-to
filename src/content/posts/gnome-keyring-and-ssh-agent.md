---
pubDatetime: 2020-01-29T09:10:01Z
modDatetime: 2020-01-29T13:40:38Z
title: "Gnome Keyring and ssh-agent"
tags:
  - "gnome"
  - "Linux"
heroImage: "/blog-media/2019/07/gnomelogohorizontal.svg_.png"
description: "Every time I fire up a zsh shell terminal in gnome-shell I can't add my ssh key to an existing ssh-agent instance. $ ssh-add Could not open a connection to"
---
Every time I fire up a zsh shell terminal in gnome-shell I can't add my ssh key to an existing ssh-agent instance.

```
$ ssh-add
Could not open a connection to your authentication agent.
```

The `gnome-keyring-daemon` is running, but it just doesn't seem to set the environment variable `SSH_AUTH_SOCK`.

I'd have to run `ssh-agent` and start one listening on a temporary socket and pass the environment settings around terminal sessions. Turns out this is a known issue and the fix is relatively easy.

For `zsh` add the environment variable to your `~/.zshrc`

```
export SSH_AUTH_SOCK=/run/user/$(id -u)/keyring/ssh
```

Now any call to `ssh-add` in a terminal works as expected.

You might want to do the same for other shells in `~/.profile` etc.
