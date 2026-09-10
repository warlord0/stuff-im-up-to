---
pubDatetime: 2020-05-21T21:00:04Z
modDatetime: 2020-05-22T08:53:42Z
title: "SSH Multiplexing"
tags:
  - "Linux"
  - "ssh"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "Typically SSH creates a new tcp session for every time you connect to a remote host. But there is a feature of ssh that allows connections to reuse an exis"
---
Typically SSH creates a new tcp session for every time you connect to a remote host. But there is a feature of ssh that allows connections to reuse an existing connection using a socket - which is called multiplexing.

Obviously this is only really useful if you are connecting via the same host, you can multiplex to different locations.

## Why is this useful?

If I already have a socks connection open to my office gateway I don't need to open a new TCP connection to pass traffic inside of the office network. Ok, you're still not sold on the idea? Well we're using a pretty robust authentication with multi-factor authentication, private keys and passwords to get in via the gateway. This would mean that for every connection I would have to go through that authentication each time. Add to that `fail2ban` and you get it wrong and your IP is blocked for 90 minutes.

> With a multiplexed connection I authenticate ONCE and my subsequent connections go through that already authenticated session.

If you look at my `socks.sh` script in [SSH and SOCKS](https://warlord0blog.wordpress.com/2020/05/18/ssh-and-socks/), you'll see it already creates a socket `~/.ssh/jump.socket`. All I need to do to use that socket is amend my `~/.ssh/config` slightly to tell all of my connections to use it if it exists, or create it automatically if it doesn't.

This is where we use `ControlMaster`, `ControlPath` and `ControlPersist`.

```
Host jump-host
        HostName gateway.domain.tld
        ForwardAgent yes
        ControlMaster auto
        ControlPersist 1
        ControlPath ~/.ssh/jump.socket
    Compression yes

Host *.domain.tld system1 system2
        HostName %h
        ProxyJump jump-host
```

If I connect to anything in my wildcard `*.domain.tld` it will use the `jump-host`, which will automatically create a socket file, that will in turn be used by any other subsequent connection.

You can also add short names to the Host line so not just a wildcard to the FQDN, but a shorter name will also work.
