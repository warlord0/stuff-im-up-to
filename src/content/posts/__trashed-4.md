---
pubDatetime: 2020-02-06T20:27:07Z
modDatetime: 2023-06-09T10:14:06Z
title: "DRBD and Linux HA"
draft: true
tags:
  - "Uncategorized"
description: "Following on from setting up a Linux HA Cluster, it's time to add a shared disk resource. It should be capable of synchronising data and integrate with our"
---
Following on from setting up a Linux HA Cluster, it's time to add a shared disk resource. It should be capable of synchronising data and integrate with our pacemaker cluster using [Linbit's DRBD](https://www.linbit.com/en/) (Distributed Redundant Block Device).

Previously, I created a pair of virtual machines, each setup with two network adapters. Now I just need to add a hard drive to each as `/dev/sdb`. Then I used a simple partitioning scheme and it ended up looking like this:

```
$ sudo fdisk -l
Disk /dev/vda: 12 GiB, 12884901888 bytes, 25165824 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x59c828b8

Device     Boot    Start      End  Sectors  Size Id Type
/dev/vda1  *        2048 23164927 23162880   11G 83 Linux
/dev/vda2       23166974 25163775  1996802  975M  5 Extended
/dev/vda5       23166976 25163775  1996800  975M 82 Linux swap / Solaris


Disk /dev/vdb: 10 GiB, 10737418240 bytes, 20971520 sectors
Units: sectors of 1 * 512 = 512 bytes
Sector size (logical/physical): 512 bytes / 512 bytes
I/O size (minimum/optimal): 512 bytes / 512 bytes
Disklabel type: dos
Disk identifier: 0x350474c1

Device     Boot Start      End  Sectors Size Id Type
/dev/vdb1        2048 20971519 20969472  10G 83 Linux
```

> **DO NOT** create a filesystem on `/dev/sdb`. This will result in a failure to create the DRBD resource later in this post.

Install the DRBD program on both system.

```
# apt install drbd-utils
```

Create a resource configuration file (again on both systems) for the proposed DRBD. I called my resource `r0`, `/etc/drbd.d/r0.res`. Ensure you use the respective IP addresses.

```
resource r0 {
         protocol C;
         meta-disk internal;
         device /dev/drbd1;
         on drbd1 {
                 disk /dev/vdb1;
                 address 10.0.0.1:7789;
         }
         on drbd2 {
                 disk /dev/vdb1;
                 address 10.0.0.2:7789;
         }
}
```

Create the `r0` resource and device `/dev/drbr1` and activate it using:

```
$ sudo modprobe drbd
$ sudo drbdadm create-md r0
$ sudo drbdadm up r0
```

Then you can view the status of drdb using cat:

```
$ cat /proc/drbd 
 version: 8.4.10 (api:1/proto:86-101)
 srcversion: 15055BDD6F0D23278182874 
 1: cs:WFConnection ro:Secondary/Unknown ds:Inconsistent/DUnknown C r----s
     ns:0 nr:0 dw:0 dr:0 al:8 bm:0 lo:0 pe:0 ua:0 ap:0 ep:1 wo:f oos:8387292
```

Make node1 the primary by using the following on node1 only:

```
$ sudo drbdadm primary --force r0
```

and check the status again by catting the `/rpoc/drbd` file:

```
$ cat /proc/drbd 
 version: 8.4.10 (api:1/proto:86-101)
 srcversion: 15055BDD6F0D23278182874 
 1: cs:SyncSource ro:Primary/Secondary ds:UpToDate/Inconsistent C r-----
     ns:13340 nr:0 dw:0 dr:13340 al:8 bm:0 lo:5 pe:0 ua:5 ap:0 ep:1 wo:f oos:8373952
         [>………………..] sync'ed:  0.2% (8176/8188)M
         finish: 1:01:34 speed: 2,220 (2,220) K/sec
```

> Before you continue to the next part and create a filesystem on `/dev/drbd1` you should wait until it has finished synchronising by monitoring `/proc/drbd` until you see it it up to date:

```
$ cat /proc/drbd 
 version: 8.4.10 (api:1/proto:86-101)
 srcversion: 15055BDD6F0D23278182874 
 1: cs:Connected ro:Secondary/Primary ds:UpToDate/UpToDate C r-----
     ns:0 nr:8387292 dw:8387292 dr:0 al:8 bm:0 lo:0 pe:0 ua:0 ap:0 ep:1 wo:f oos:0
```

Or check the status using the `drbdadm` command:

```
$ sudo drbdadm status
 r0 role:Primary
   disk:UpToDate
   peer role:Secondary
     replication:Established peer-disk:UpToDate
```

Create a `gfs2` filesystem on the `/dev/drbd1` device. We use GFS2 because it's a cluster aware filesystem and can handle locking. We will also need to install both the gfs2 and dlm program (Distributed Lock Manager) on both nodes.

```
# apt-get install gfs2-utils dlm-controld
```

Install pacemaker, which will pull all the dependencies for clustering.

```
# apt-get install pcs
```

Set the password for the `hacluster` user on each node, authenticate the nodes with the cluster and setup the cluster:

```
# passwd hacluster
# pcs host auth node1 -u hacluster -p [SuperSecretKey]
# pcs host auth node2 -u hacluster -p [SuperSecretKey]
# pcs cluster setup MyCluster node1 addr=10.69.69.1 node2 addr=10.69.69.2
# pcs cluster enable
# pcs cluster start
```

Add the `/dev/drbd1` resource to the cluster.

```
# pcs resource create drbd1 ocf:linbit:drbd drbd_resource=r0 op monitor interval=60s
# pcs resource promotable drbd1 master-max=1 master-node-max=1 clone-max=2 clone-node-max=1 notify=true
```

```
```

```
# pcs resource create drbd1FS Filesystem device="/dev/drbd1" directory="/mnt/target1" fstype="xfs" op monitor interval=60s role="Sttarted"
# pcs constraint colocation add drbd1FS with drbd1-clone INFINITY with-rsc-role=Master
```

test

```
# pcs status

Cluster name: mycluster
Stack: corosync
Current DC: node1 (version 2.0.1-9e909a5bdd) - partition with quorum
Last updated: Mon Dec 23 20:18:12 2019
Last change: Mon Dec 23 18:58:56 2019 by root via cibadmin on node1
2 nodes configured
6 resources configured
Online: [ node1 node2 ]
Full list of resources:
ClusterIP      (ocf::heartbeat:IPaddr2):       Started node1
 Clone Set: drbd1-clone drbd1
     Masters: [ node1 ]
     Slaves: [ node2 ]
 drbd1FS        (ocf::heartbeat:Filesystem):    Started node1
 Clone Set: dlm-clone [dlm]
     Started: [ node1 node2 ]
Daemon Status:
  corosync: active/enabled
  pacemaker: active/enabled
  pcsd: active/enabled
```

```
# mkfs.gfs2 -p lock_dlm -j 2 -t mycluster:drbd1 /dev/drbd1
It appears to contain an existing filesystem (xfs)
This will destroy any data on /dev/drbd1
Are you sure you want to proceed? [y/n] y
Discarding device contents (may take a while on large devices): Done
Adding journals: Done 
Building resource groups: Done   
Creating quota file: Done
Writing superblock and syncing: Done
Device:                    /dev/drbd1
Block size:                4096
Device size:               8.00 GB (2096823 blocks)
Filesystem size:           8.00 GB (2096820 blocks)
Journals:                  2
Journal size:              32MB
Resource groups:           34
Locking protocol:          "lock_dlm"
Lock table:                "mycluster:drbd1"
UUID:                      e918b745-0d52-432f-8db4-12344f57c2d5
```

### Notes

When you create the resource make sure the names used exactly match (case sensitive) the entries in your `/etc/hosts` file for the names of the servers. Failure to do so will result in a strange message when you try to create the resource using `drbdadm`:

```
 $ sudo drbdadm create-md r0
 'r0' not defined in your config (for this host).
```
