---
pubDatetime: 2020-10-13T08:09:22Z
modDatetime: 2020-10-13T16:58:24Z
title: "iSCSI and Multipath"
tags:
  - "Linux"
description: "If you've installed the open-iscsi and multipath-tools you might still find that you multipaths aren't working. sudo apt install open-iscsi multipath-tools"
---
If you've installed the `open-iscsi` and `multipath-tools` you might still find that you multipaths aren't working.

```
sudo apt install open-iscsi multipath-tools
```

```
$ sudo lsblk
NAME MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
sda 8:0 0 50G 0 disk /mnt/sda
sdb 8:16 0 40G 0 disk /mnt/sdb
sdc 8:32 0 50G 0 disk
sdd 8:48 0 40G 0 disk
```

I ended up with the disk devices `sda`, `sdb`, `sdc` and `sdd` but no multipath.

If I ran multipath I got nothing, eg.

```
$ sudo multipath -ll
```

This is because I'm missing some defaults in the config file.

#### /etc/multipath/multipath.conf

```
defaults {
  user_friendly_names yes
  find_multipaths yes
}
```

Now I can scan and see my devices as multipath.

```
$ sudo lsblk
NAME MAJ:MIN RM SIZE RO TYPE MOUNTPOINT
sda 8:0 0 50G 0 disk
└─360000000000000000e00000000010001 253:2 0 50G 0 mpath
sdb 8:16 0 40G 0 disk
└─360000000000000000e00000000010002 253:3 0 40G 0 mpath
sdc 8:32 0 50G 0 disk
└─360000000000000000e00000000010001 253:2 0 50G 0 mpath
sdd 8:48 0 40G 0 disk
└─360000000000000000e00000000010002 253:3 0 40G 0 mpath
```

and

```
$ sudo multipath -ll
360000000000000000e00000000010002 dm-3 IET,VIRTUAL-DISK
size=49G features='2 queue_mode mq' hwhandler='0' wp=rw
|-+- policy='service-time 0' prio=1 status=active
| '- 14:0:0:2 sdb 8:16 active ready running
  '-+- policy='service-time 0' prio=1 status=enabled
  '- 15:0:0:2 sdd 8:48 active ready running
360000000000000000e00000000010001 dm-2 IET,VIRTUAL-DISK
size=49G features='2 queue_mode mq' hwhandler='0' wp=rw
|-+- policy='service-time 0' prio=1 status=active
| '- 14:0:0:1 sda 8:0 active ready running
  '-+- policy='service-time 0' prio=1 status=enabled
  '- 15:0:0:1 sdc 8:32 active ready running
```

From here I can carry on and use the volumes as normal knowing that I have multipath to each.
