---
pubDatetime: 2023-06-19T07:14:33Z
modDatetime: 2023-10-09T20:11:35Z
title: "Virtual Machine Clustering"
tags:
  - "drbd"
  - "kvm"
  - "Linux"
  - "proxmox"
  - "qemu"
  - "Virtualisation"
  - "zfs"
heroImage: "/blog-media/2023/06/proxmox.png"
description: "We've put together a number of mid-spec servers to carry out some testing on clustering using Proxmox . Many years ago I built a single Proxmox server and"
---
We've put together a number of mid-spec servers to carry out some testing on clustering using [Proxmox](https://www.proxmox.com/en/).

Many years ago I built a single Proxmox server and hosted a few virtual machines, a mixture of Windows, and Linux guests. This time it's a much newer version of Proxmox, and we have a bunch of servers that I want to bring together in a cluster.

Following the [installation guide](https://pve.proxmox.com/pve-docs/pve-admin-guide.html#chapter_installation) results in a very straight forward installation, booting from the downloaded ISO (using [Ventoy – One Stick to Boot them All](/posts/ventoy-one-stick-to-boot-them-all/)).

The servers are [HPe Proliant DL360 (Gen9)](https://www.hp.com/hpinfo/newsroom/press_kits/2014/ComputeEra/HP_ProLiantDL360Gen9Server_DataSheet.pdf) - 48 cores - Intel(R) Xeon(R) CPU E5-2680 v3 @ 2.50GHz (2 Sockets) with 256 GB RAM, and 2 x SAS 300 GB Drives on a SmartArray Controller.

The first thing I did was break the array on the SmartArray controller. I want to use ZFS on them ([Hardware RAID is dead](https://www.youtube.com/watch?v=l55GfAwa8RI)), and the HP SmartArray is unnecessary for that. I really need at least 2 volumes for ZFS mirroring. Put the SmartArray into HBA mode, and that disables the fancy hardware RAID, letting you get on with letting ZFS handle it.

With two disks, I follow the installation process and create a ZFS mirror pair. Ultimately the servers are to be considered compute nodes, the actual VM guest shared storage will be external to them. This means the compute servers become pretty disposable, and adding and removing compute nodes to the cluster is trivial. It may even be worth considering booting from SD cards, with no RAID, as nothing critical is stored, only the network config, and that it's part of a cluster - all of which can quickly be rebuilt from a fresh installation.

For the network configuration, I have each server with a pair of 10 GB SFP's with all of our VLAN's tagged, and the default VLAN for the server LAN. This created an interface called `vmbr0`. Once booted, from the Web GUI I then enabled "VLAN Aware" on that interface. Longer term, the NIC's will be more complex as we'll probably separate iSCSI, LAN and cluster traffic to specific NIC's, as the servers have plenty of 1 GB NIC's we can bond, leaving the 10 GB SFP's for iSCSI.

For the most part, installing Proxmox from the ISO is way easier than installing Proxmox on top of an existing Debian installation. This is for the simple reason I found later, that installing [OpenZFS](https://openzfs.org/wiki/Main_Page) as root, and boot, requires quite a significant investment in time, and brain power following the [OpenZFS installation guide](https://openzfs.github.io/openzfs-docs/Getting%20Started/Debian/Debian%20Buster%20Root%20on%20ZFS.html). Far easier to let the Proxmox installer do the heavy lifting. Still, there are reasons you may yet want to study installing OpenZFS as root on Debian - our next steps with Proxmox involve using a shared backend data store to host guest VM's using [DRBD](https://linbit.com/drbd/), ZFS and [iSCSI](https://wiki.archlinux.org/title/ISCSI/LIO).

After Proxmox is installed on three of our servers, it's a simple matter to create a cluster, and link them all together using the management web GUI.

Once clustered, migrating VM guests from one host to another is as seamless as I recall in a non-open source virtual platform. At this stage building some VM guests was just a simple test, we're not intending to use the SAS disk for anything VM related, they are just to be the Proxmox boot disks. As a simple demonstration, I began an upgrade process of a Debian 9 (Stretch) guest to Debian 10 (Buster), and did a migration whilst it was in progress. The process didn't miss a beat, and carried on across to the new host like nothing had happened.

The aim is to build a bulletproof virtualisation platform, where we can fail virtual machines across to other hosts, whilst maintaining a resilient connection to the backend storage, which in itself is HA cluster. Then on those VM guests build a clustered application virtualisation system that too can migrate between application hosts.

See also [Virtual Machine Clustering, part 2](/posts/virtual-machine-clustering-part-2/)
