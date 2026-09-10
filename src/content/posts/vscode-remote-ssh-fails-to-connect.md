---
pubDatetime: 2022-03-01T15:05:02Z
modDatetime: 2022-03-02T09:33:05Z
title: "VSCode Remote SSH Fails to Connect"
tags:
  - "Linux"
  - "ssh"
  - "vscode"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "This cost me a few hours today. I thought my ssh config was messed up as nothing i did would allow me to get onto my remote workstation, but it worked fine"
---
This cost me a few hours today. I thought my ssh config was messed up as nothing i did would allow me to get onto my remote workstation, but it worked fine on some other systems.

**Short answer** - change your default shell to `/bin/bash` on the remote system.

Mine is set in LDAP to `/bin/zsh`, which meant I had to go change it there and not by using `chsh` Looks to have been fixed now, but in the version I'm running in Manjaro/Arch I still have to do the workaround.

The shell override in vscode is only for the terminal. It must use bash to install/upgrade the server remotely.

## References:

[https://github.com/microsoft/vscode-remote-release/issues/6394](https://github.com/microsoft/vscode-remote-release/issues/6394)
