---
pubDatetime: 2022-11-01T18:19:01Z
modDatetime: 2022-11-03T09:01:46Z
title: "Manjaro - Static IP Address"
tags:
  - "dhcp"
  - "Linux"
  - "manjaro"
  - "Networking"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "It surprised me today that all of my Manjaro builds are using DHCP. I needed to make one of the devices a static IP, as it delivers DHCP, and would be a cy"
---
It surprised me today that all of my Manjaro builds are using DHCP. I needed to make one of the devices a static IP, as it delivers DHCP, and would be a cyclic relationship if it tried to get an IP address from itself before it enabled the interface used to give out IP addresses.

Apparently there are a number of ways to do this. Using `netctl` and/or `systemd`, I went with `netctl` as that seemed more common.

Install `netctl` with pamac.

```
pamac install netctl
```

Copy an example file for static to the name of your interface:

```
sudo cp /etc/netctl/examples/ethernet-static /etc/netctl/enp1s0 
```

Edit the file and make the appropriate changes to match your needs.

```
Description='A basic static ethernet connection'
Interface=enp1s0
Connection=ethernet
IP=static
Address=('192.168.0.101/24')
Gateway='192.168.0.1'
DNS=('192.168.0.101')
```

Then enable the device using `netctl` which creates a profile for `systemd` to use.

```
sudo netctl enable enp1s0
sudo netctl start enp1s0
```

**IMPORTANT:** Remember to enable the `netctl` service, or it won't get an IP address at boot!

```
sudo systemctl enable --now netctl
```
