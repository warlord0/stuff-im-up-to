---
pubDatetime: 2022-10-24T16:50:27Z
modDatetime: 2022-10-28T09:11:21Z
title: "WireGuard Gnome Extension"
tags:
  - "gnome"
  - "Linux"
  - "Networking"
  - "vpn"
  - "wireguard"
heroImage: "/blog-media/2020/04/wireguard.png"
description: "This gives the users a very convenient means of enabling and disabling WireGuard tunnels. Install the Extension from: https://extensions.gnome.org/extensio"
---
This gives the users a very convenient means of enabling and disabling WireGuard tunnels.

Install the Extension from:

[https://extensions.gnome.org/extension/3612/wireguard-indicator/](https://extensions.gnome.org/extension/3612/wireguard-indicator/)

## Configuration

You have two ways to configure WireGuard. Use it from the command line using `wg-quick` or use it as a systemd service.

### systemd and Network Manager

I like to use it as a service, which means importing the config file into `nmcli`.

```
sudo nmcli connection import type wireguard file wg0.conf
sudo systemctl enable --now wg-quick@wg0.service
```

\
Replace `wg0.conf` with whatever name you use for the tunnel. Mostly users will have only one tunnel, so `wg0` is fine. If you have more than one, give them creative names like `office.conf`.

Once imported, you can set the gnome extension to use `nmcli` and `sudo`. You can then ignore the services, as it will fetch the tunnel names from the network manager.

### Command Line

If you want to run from the command line rather than extension, you can use the following:

sudo systemctl start wg-quick@wg0.conf\
sudo systemctl stop wg-quick@wg0.conf

### Config file /etc/wireguard

If you prefer, you can continue to store the config file(s) in `/etc/wireguard`. But as the extension then cannot use `nmcli` to get the tunnel names, you need to add in the names yourself. First create and enable the tunnel service:

```
sudo systemctl enable --now wg-quick@wg0.service
```

In the extension settings, turn off `nmcli`, and turn ON sudo.

You then use the service name in the extension config, eg. `wg-quick@wg0.service`

## References

[https://www.cyberciti.biz/faq/how-to-import-wireguard-profile-using-nmcli-on-linux/](https://www.cyberciti.biz/faq/how-to-import-wireguard-profile-using-nmcli-on-linux/)
