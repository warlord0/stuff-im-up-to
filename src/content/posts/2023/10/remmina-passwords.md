---
pubDatetime: 2023-10-04T15:44:12Z
title: "Remmina Passwords"
tags:
  - "Linux"
  - "Security"
heroImage: "/blog-media/2020/02/remmina.png"
description: "When you save the password in the config for a remote connection, where does it go? I was remote to my work station and needed to find the password for a r"
---
When you save the password in the config for a remote connection, where does it go?

I was remote to my work station and needed to find the password for a remote VNC account. Usually they're in my password manager, but this time I must have been remiss and I didn't know what it was.

I know the configs are stored under `~/.local/share/remmina`, but there are no passwords in there.

After some trawling, the answer is simple.

```
secret-tool search --all key password|less
```

This listed all the configs and passwords for me to search through.

## References

I'm using Manjaro, but the instructions here worked for me without needed to install anything.

[https://askubuntu.com/a/1264777](https://askubuntu.com/a/1264777)
