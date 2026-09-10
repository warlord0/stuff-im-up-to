---
pubDatetime: 2023-06-26T20:23:01Z
modDatetime: 2023-06-26T20:36:07Z
title: "Virtual Machine Clustering, part 2"
tags:
  - "corosync"
  - "drbd"
  - "kvm"
  - "Linux"
  - "lvm"
  - "pacemaker"
  - "proxmox"
  - "qemu"
  - "Virtualisation"
  - "zfs"
heroImage: "/blog-media/2023/06/proxmox.png"
description: "Following on from Virtual Machine Clustering , it's taken a while to get things working as I want them. The least difficult part has been Proxmox. When it"
---
Following on from [Virtual Machine Clustering](/posts/virtual-machine-clustering/), it's taken a while to get things working as I want them. The least difficult part has been Proxmox. When it comes to creating VM's on a cluster when all Proxmox is providing is the compute node is an absolute breeze.

As Proxmox version 8 was released last week, I decided to replace/upgrade compute nodes from v7.4 to v8. As nothing is stored on the nodes (in my environment), it was simple enough to, migrate all VM's to another host, remove the node from the cluster, reinstall it with v8, add in the same network config and rejoin the cluster. Rinse and repeat until they are all v8.

## Backend Storage

All the back end storage is using iSCSI, backed by LVM (Not ZFS, as I'd have preferred), DRBD and MD raid. This is where the headaches are.

### ZFS

Using [ZFS-over-iSCSI](https://pve.proxmox.com/wiki/Storage:_ZFS_over_ISCSI) worked really well. It created and allocated the ZFS dataset in the pool, created the iSCSI LUN and bound it to the backing store. The iSCSI access worked as it should, the migrations too... but, using this does NOT tell DRBD about the LUN's. So DRBD does not know they need to be managed in a storage cluster fail over. This left LUN's held open by vdev, and DRBD would fail to demote/promote the pool between servers.

Initially I moved away from ZFS-over-iSCSI, and manually created the ZFS dataset, and the LUN's in DRBD. DRBD now knows about the LUN's, and should, with the help of the pacemaker ZFS agent, allow the pool to fail over. But, it seems to get bound up on something. The ZFS agent fails as soon as the DRBD resource is demoted. I hoped it would be a constraint "order" issue, but I could not get ZFS to release the pool before the demotion began. This left the ZFS resource blocked and resulted in the DRBD resource becoming failed.

A "pcs resource refresh" on ZFS and then the DRBD resource saw it fire back into life, fail over and behave as expected, but I could not get it to do it without intervention.

> I then began to think, "Why am I using ZFS, if I can't use ZFS-over-iSCSI?".

### LVM

I may as well switch to using LVM on the DRDB resource instead. Still using the same iSCSI manual creation of LUN's, but this time with the pacemaker agent for "LVM-activate".

After installing `lvm2`, `lvmlockd` and `dlm` I configured LVM for locking. Because I had a multi-homed server `dlm` initially complained that it could not use `TCP`, and to change to `SCTP`. I created `/etc/dlm/dlm.conf` with one line:

```
protocol=sctp
```

Restarted `pacemaker`, `corosync`, `dlm`, `lvmlockd` and `lvmlocks`. Then I could begin creating LVM groups with `dlm` locking enabled.

```
vgcreate --shared --lock-type dlm vgdrbd0 /dev/drbd0
```

Creating a disk for a VM is done using:

```
lvcreate --name vm100 --size 20G vgdrbd0
```

## Pacemaker

I can then create the LUN, and add in the constraints, so that it follows the iSCSI target:

```
pcs resource create vgdrbd0_vm100 ocf:heartbeat:iSCSILogicalUnit \
    target_iqn="iqn.2003-01.org.linux-iscsi.cluster0:vgdrbd0" \
    implementation=lio-t lun="100" path="/dev/vgdrbd0/vm100" \
    op start timeout=20 \
    op stop timeout=20 \
    op monitor interval=20 timeout=40

pcs resource group add iscsi_group vgdrbd0_vm100

pcs constraint colocation add vgdrbd0_vm100 with iscsi_target_vgdrbd0

pcs constraint order iscsi_target_vgdrbd0 then start vgdrbd0_vm100
```

This creates the LUN that can be seen in `targetcli` and can be found by the `iscsiadm` tool on the Proxmox initiators. There is one clever part I called in here, use the VM ID (100 in this case) as the LUN ID. This way when I look for the LUN to add/create my VM with, I can easily see which it is in Proxmox, as it is shown as `CH 00 ID 0 LUN 100`.

Testing failovers worked smoothly with LVM. I could put a storage node into standby mode, and all the resources, including "LVM-activate", and iSCSI LUN's would migrate to the other node.

Sadly it means I can't manage my storage quite as easily from Proxmox, as I'd have liked, but I can still create, snapshot, and resize LVM's from the storage cluster.
