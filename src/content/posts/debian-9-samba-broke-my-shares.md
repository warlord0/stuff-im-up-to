---
pubDatetime: 2017-07-17T13:49:49Z
modDatetime: 2017-07-18T10:12:52Z
title: "Debian 9, SAMBA broke my Shares"
tags:
  - "Linux"
  - "samba"
description: "I updated my workstation to Debian 9 (stretch) today and immediately after could no longer connect to any of my Windows fileshares. Guessing this was proba"
---
I updated my workstation to Debian 9 (stretch) today and immediately after could no longer connect to any of my Windows fileshares. Guessing this was probably down to changes we made on the Windows servers that disabled SMB v1 it took a little bit of googling to get things working again. Edit `/etc/samba/smb.conf` with admin rights and add the following lines into the `[global]` section.

    client max protocol = SMB3
    client ipc max protocol = NT1

Save the file and restart the Samba service.

    $ sudo systemctl restart samba

  References: [https://forums.linuxmint.com/viewtopic.php?t=220721](https://forums.linuxmint.com/viewtopic.php?t=220721)
