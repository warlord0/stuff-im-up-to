---
pubDatetime: 2017-08-03T08:34:42Z
modDatetime: 2017-08-03T08:35:57Z
title: "SMB mount error(112): Host is down"
tags:
  - "debian"
  - "Linux"
description: "Whilst trying to mount a Windows (cifs) volume onto my Linux workstation I encountered the following error: $ sudo mount -t cifs -o user=mylogon //myserver"
---
Whilst trying to mount a Windows (cifs) volume onto my Linux workstation I encountered the following error:

    $ sudo mount -t cifs -o user=mylogon //myserver/myshare /mnt/mountpoint 
    Password for mylogon@//myserver/myshare: ***********
    mount error(112): Host is down
    Refer to the mount.cifs(8) manual page (e.g. man mount.cifs)

As ever with Windows I suspected the SMBv1 disabled problem and wasn't disappointed to discover this was precisely the issue. In order to ensure that mount uses an appropiate version of the SMB protocol you just need to add that in as an option (-o).

    $ sudo mount -t cifs -o user=mylogon,vers=2.0 //myserver/myshare /mnt/mountpoint

  References: [https://serverfault.com/questions/414074/mount-cifs-host-is-down](https://serverfault.com/questions/414074/mount-cifs-host-is-down)
