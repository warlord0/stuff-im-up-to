---
pubDatetime: 2018-08-15T12:54:38Z
title: "Sudo and Proxy / Environment Settings"
tags:
  - "Linux"
  - "proxy"
description: "When you run a program using sudo what tends to happen is the sudo/root account fails to do anything useful on the internet. It times out trying to connect"
---
When you run a program using `sudo` what tends to happen is the sudo/root account fails to do anything useful on the internet. It times out trying to connect to systems to download updates that are required by elevated permissions. We discovered using `sudo composer self-update` failed to update the core instance of composer, not because of permissions, but because it could not get to the internet to download it. Set the environment variables that get persisted within your `/etc/sudoers` file by running:

    $ sudo visudo

Seach for the line

    Defaults    env_reset

and change it to

    Defaults    env_keep += "ftp_proxy http_proxy https_proxy no_proxy"

Now your proxy will be set within your sudo environment too.

### References

Source: [https://stackoverflow.com/questions/8633461/how-to-keep-environment-variables-when-using-sudo](https://stackoverflow.com/questions/8633461/how-to-keep-environment-variables-when-using-sudo)
