---
pubDatetime: 2020-10-13T08:26:24Z
modDatetime: 2020-10-13T20:21:51Z
title: "DRBD and LVM"
tags:
  - "Linux"
description: "To use LVM as a backing store you need to install a locking mechanism and build the volume groups with the --shared option. sudo apt install drbd-utils lvm"
---
To use LVM as a backing store you need to install a locking mechanism and build the volume groups with the `--shared` option.

```
sudo apt install drbd-utils lvm2 lvm2-lockd sanlock
```

Edit `/etc/lvm/lvm.conf` and change `use_lvmlockd` to 1, add in a `locking_type` value of 1 and set the `system_id_source` to `lvmlocal` in the `global` section.

#### /etc/lvm/lvm.conf

```
global {
  locking_type = 1
  use_lvmlockd = 1
  system_id_source = "lvmlocal"
  ...
}
```

Edit `/etc/lvm/lvmlocal.conf` and set the `system_id` and `host_id` to identify each system, eg.

```
local {
  system_id = "node1"
  host_id = 1
  ...
}
```

Create your physical volume and volume group.

```
sudo pvcreate /dev/md1
```

We're using `md1` as this is our software RAID5 data volume, `md0` is the root OS volume.

If you can't create this you might have to edit the filter in /etc/lvm/lvm.conf so it allows the use of `/dev/md` wildcards, eg.

```
filter = [ "a|/dev/sd.*|", "a|/dev/drbd.*|", "a|/dev/md.*|", "r|.*|" ]
```

```
$ sudo pvdisplay
--- Physical volume ---
PV Name /dev/md1
VG Name VG1
PV Size 2.48 TiB / not usable 4.00 MiB
Allocatable yes
PE Size 4.00 MiB
Total PE 650639
Free PE 650575
Allocated PE 64
PV UUID ii1G9k-Uflp-AnQz-5l9o-1Fcq-CTp1-phjAst

$ sudo vgcreate --shared VG1 /dev/md1
Enabling sanlock global lock
Logical volume "lvmlock" created.
Volume group "VG1" successfully created
VG VG1 starting sanlock lockspace
Starting locking. Waiting until locks are ready…
```

Start the lock space.

```
sudo vgchange --lock-start
```

Create logical volumes.

```
sudo lvcreate --size 10G --name volume1 VG1
```

Create a drbd resource file `/etc/drbd.d/r0.res`

```
resource r0 {
  on smicro1 {
    device /dev/drbd1 minor 1;
    disk /dev/VG1/volume1;
    meta-disk internal;
    address ipv4 10.69.69.1:7789;
  }
  on smicro2 {
    device /dev/drbd1 minor 1;
    disk /dev/VG1/volume1;
    meta-disk internal;
    address ipv4 10.69.69.2:7789;
  }
  net {
    max-buffers 36k;
    protocol C;
  }
  disk {
    on-io-error detach;
    c-plan-ahead 7;
    c-fill-target 64M;
    c-max-rate 768M;
  }
}
```

Create the metadata for the drbd resource and bring up the device.

```
sudo drbdadm create-md r0
sudo drbdadm up r0
```

View the status of drbd.

```
$ cat /proc/drbd
version: 8.4.10 (api:1/proto:86-101)
srcversion: 473968AD625BA317874A57E
1: cs:WFConnection ro:Secondary/Unknown ds:Inconsistent/DUnknown C r----s
ns:0 nr:0 dw:0 dr:0 al:8 bm:0 lo:0 pe:0 ua:0 ap:0 ep:1 wo:f oos:10485404

$ sudo drbdadm status
r0 role:Secondary
  disk:Inconsistent
  peer connection:Connecting
```

Force the first node into becoming primary.

```
sudo drbdadm primary --force r0
```

Recheck the status, it should show as primary.

```
$ cat /proc/drbd
version: 8.4.10 (api:1/proto:86-101)
srcversion: 473968AD625BA317874A57E
1: cs:WFConnection ro:Primary/Unknown ds:UpToDate/DUnknown C r----s
ns:0 nr:0 dw:0 dr:0 al:8 bm:0 lo:0 pe:0 ua:0 ap:0 ep:1 wo:f oos:10485404

$ sudo drbdadm status
r0 role:Primary
  disk:UpToDate
  peer connection:Connecting
```

Repeat the creation of metadata and bring up the other node. And check the status of drbd. You can see from this it moves pretty quick for a 10G volume.

```
$ sudo drbdadm create-md r0
initializing activity log
initializing bitmap (320 KB) to all zero
Writing meta data…
New drbd meta data block successfully created.

$ sudo drbdadm up r0

$ sudo drbdadm status
r0 role:Secondary
  disk:Inconsistent
  peer role:Primary
    replication:SyncTarget peer-disk:UpToDate done:26.69

$ cat /proc/drbd
version: 8.4.10 (api:1/proto:86-101)
srcversion: 473968AD625BA317874A57E

 1: cs:SyncTarget ro:Secondary/Primary ds:Inconsistent/UpToDate C r---b-
    ns:0 nr:7573504 dw:7520256 dr:0 al:8 bm:0 lo:52 pe:22 ua:52 ap:0 ep:1 wo:f oos:2965148
    [=============>……] sync'ed: 71.8% (2892/10236)M
finish: 0:00:05 speed: 537,160 (537,160) want: 664,440 K/sec
```

Eventually the status will show everything is up to date.

```
$ sudo drbdadm status
r0 role:Secondary
  disk:UpToDate
  peer role:Primary
    replication:Established peer-disk:UpToDate
```
