---
pubDatetime: 2026-07-30T11:11:43+00:00
title: "Hashed Known Hosts File"
tags:
  - "Linux"
  - "Ssh"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "To set known hosts to unencrypted save in Ubuntu, you can modify your SSH configuration by editing the ~/.ssh/config file and adding the line HashKnownHosts no. This will ensure that hostnames are stored in plain text rather than hashed. Make sure to back up your existing configuration before making changes."
---
To set known hosts to unencrypted save in Ubuntu, you can modify your SSH configuration by editing the `~/.ssh/config` file and adding the line `HashKnownHosts no`. This will ensure that hostnames are stored in plain text rather than hashed. Make sure to back up your existing configuration before making changes.
