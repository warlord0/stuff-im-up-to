---
pubDatetime: 2019-07-10T11:45:04Z
modDatetime: 2019-07-10T12:03:19Z
title: "Wired 802.1X on Linux"
tags:
  - "Linux"
  - "Networking"
  - "radius"
description: "For a while I've been meaning to fix my workstation. When it comes to remote accessing it from home I find I can't because I've followed the green guidance"
---
For a while I've been meaning to fix my workstation. When it comes to remote accessing it from home I find I can't because I've followed the green guidance and turned it off when I went home. Even if I get someone to turn it on for me I still can't get to it.

This is because in the office we use RADIUS for network authentication, even on wired connections. What happens is that my network interfaces don't go online until my desktop session has logged in and then authenticates with the RADIUS server using 802.1X.

In the graphical world of my desktop my credentials are entered into the network settings dialog under the security tab. But at boot time there are no credentials and so no network access.

To resolve this I need to have Linux fire the WPA supplicant at startup.

These articles gave me a clue:

- [https://wiki.debian.org/WPA](https://wiki.debian.org/WPA)
- [http://home.telkomsa.net/richm/hp-nx6125.html](http://home.telkomsa.net/richm/hp-nx6125.html)

I edited my `/etc/network/interfaces` and added in a `default` entry to call on the `wpa_supplicant.conf`

```
$ sudo vi /etc/network/interfaces

iface default inet dhcp
   wpa-roam /etc/wpa_supplicant/wpa_supplicant.conf
```

Then created the `/etc/wpa_supplicant/wpa_supplicant.conf` file, with the relevant credentials:

```
ctrl_interface=/var/run/wpa_supplicant

ap_scan=0
network={
  key_mgmt=IEEE8021X
  eap=PEAP
  identity="UserOrMachine"
  password="mysupersecretpassword"
  phase2="autheap=MSCHAPV2"
}
```

Make sure you set the file as root owned and set the permissions to root only so you don't leak the password to users:

```
$ sudo chown root:root /etc/wpa_supplicant/wpa_supplicant.conf
$ sudo chmod 600 /etc/wpa_supplicant/wpa_supplicant.conf
```

Then I tested it using the `wpa_cli` command.

```
$ sudo wpa_cli reassociate                                                        
 Selected interface 'eno1'
 OK
```

A reboot of the machine and now I can access it even though the user has not logged on.
