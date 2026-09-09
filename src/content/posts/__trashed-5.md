---
pubDatetime: 2020-02-06T20:27:10Z
modDatetime: 2020-02-06T20:37:32Z
title: "Linux HA Cluster"
tags:
  - "Linux"
description: "Until recently my exposure to Linux HA has sat firmly on the side of deploying systems that sit on top of highly resilient platforms like VMWare that handl"
---
Until recently my exposure to Linux HA has sat firmly on the side of deploying systems that sit on top of highly resilient platforms like VMWare that handle all of the network interface and storage high availability and fail over.

Recently I've started looking at physical Linux deployments that require their own high availability solution.

I began looking at resilient storage and discovered that the most prevalent product in use is Linbit's DRBD - Distributed Redundant Block Device. Getting DRBD installed and working went pretty well and was fairly straight forward, but then what do I do about network interfaces and system services?

I've used VRRP in the past to maintain a high availability load balancer, and come across heartbeat to handle scripted fail overs. So I began looking more into heartbeat. My first mistake was to look at it in isolation. Had I continued to read through the DRBD documentation I'd have discovered other related programs that bring everything together - [https://www.clusterlabs.org/](https://www.clusterlabs.org/)

I created a server and called it `node1` and configured it with a pair of network interfaces. I setup one NIC (enp0s3) to access the existing LAN.and the other (enp0s8) with an internal network, with a view to being able to talk to other cluster members of an isolated network.

The LAN is 192.168.0.0/24 and the cluster communication was setup for 10.0.0.0/24. Node1 using the suffix 221 and the planned node2 as 222.

#### /etc/network/interfaces

```
source /etc/network/interfaces.d/*
 auto lo
 iface lo inet loopback
 allow-hotplug enp0s3
 iface enp0s3 inet static
   address 192.168.0.221
   netmask 255.255.255.0
   gateway 192.168.0.1
   dns-nameservers 192.168.0.3
 allow-hotplug enp0s8
 iface enp0s8 inet static
   address 10.0.0.221
   netmask 255.255.255.0
```

Then added the following cluster communication IP address entries to `/etc/hosts`.

```
10.0.0.221      node1
10.0.0.222      node2
```

After initially installing various components following the guidance I rolled things back and settled on a more simple way of getting the first cluster installed and running by installing a few simple components that drag all the others in as a dependency - `pcs` and `heartbeat`.

```
# apt install pcs heartbeat
```

This installed all of the parts needed for HA - hearbeat, [pacemaker](https://clusterlabs.org/pacemaker/), [corosync](https://corosync.github.io/corosync/) and the management tool pcs.

It should also have created a user called `hacluster` but it does not have a password. You should set a password on both hosts so you can use it to authenticate cluster commands between hosts.

```
# passwd hacluster
```

I then repeated the process to create another identical machine. This time I named it `node2` and used the IP address suffixes as 222. Then once it was ready I used `pcs` on `node1` to add it to the `node1` cluster.

By default corosync sets up a cluster node for us. It already exists in the config file with a node name of `node1` but we aren't going to leave that in so we'll destroy the cluster and recreate it on both nodes.

```
# pcs cluster setup mycluster node1 node2
# pcs cluster start node1 node2
# pcs status
Cluster name: mycluster
WARNINGS:
No stonith devices and stonith-enabled is not false
Stack: corosync
Current DC: node2 (version 2.0.1-9e909a5bdd) - partition with quorum
Last updated: Mon Dec 23 20:58:34 2019
Last change: Mon Dec 23 20:58:32 2019 by hacluster via crmd on node2
2 nodes configured
0 resources configured
Online: [ node1 node2 ]
No resources
Daemon Status:
  corosync: active/disabled
  pacemaker: active/disabled
  pcsd: active/enabled
```

Now `pcs status` should show your cluster is up and running with both nodes, but still with no resources.

The main thing is that cluster comms are working and you can see both nodes. You can issue `pcs` commands to put the nodes into maintenance or standby modes:

```
# pcs node maintenance node2
# pcs node unmaintenance node2 
# pcs node standby node2 
# pcs node unstandy node2 
```

### Adding Resources

In order for a cluster to function as a cluster we need to give it some shared resources that will fail between nodes.

Essentially an IP address on our LAN that will seamlessly move between nodes based on availability. In this case I chose to use the suffix 220 so the shared LAN IP address is 192.168.0.220.

```
# pcs resource create ClusterIP ocf:heartbeat:IPaddr2 ip=192.168.0.220 cidr_netmask=24 op monitor interval=30s
```

Right now when you list the `pcs status` the resource will be listed but it is stopped. As were in a non-production environment we've not setup STONITH - Shoot The Other Node In The Head. Which is a pretty funny acronym for a mechanism for a stalled/rogue node to be taken down at a more physical level. If a cluster node loses comms for some reason, you would need to reboot it, but you can't because the comms are down. You can only power it off and on. STONITH is a means that can be used to operate a physical or Out Of Band mechanism to kill the power on the rogue node. We don't have anything for that so we'll need to disable it.

```
# pcs property set stonith-enabled=false
```

Now `pcs status` should show our cluster is active and with a resource.

```
pcs status
 Cluster name: mycluster
 Stack: corosync
 Current DC: node2 (version 2.0.1-9e909a5bdd) - partition with quorum
 Last updated: Mon Dec 23 21:01:57 2019
 Last change: Mon Dec 23 21:01:56 2019 by root via cibadmin on node1
 2 nodes configured
 1 resource configured
 Online: [ node1 node2 ]
 Full list of resources:
 ClusterIP      (ocf::heartbeat:IPaddr2):       Started node1
 Daemon Status:
   corosync: active/disabled
   pacemaker: active/disabled
   pcsd: active/enabled
```

You can then test the cluster failover by using another system on your LAN to continuously ping 192.168.0.222 and then stop the node that is currently hosting the ClusterIP resource.

```
# pcs cluster stop node1
```

If your resources fails over you probably wont even see a break in the ping. But if you run pcs status you'll see the resource is now on node2.

```
ClusterIP      (ocf::heartbeat:IPaddr2):       Started node2
```

Restart the cluster on `node1` and the resource shouldn't move back on it's own as we've not gone as far as setting any preferred nodes and it's probably not a good idea if we are going to use the cluster to host file-systems and database services.

Ensure that the resources for WebServer and VirtualIP stay together using 'colocation' and make sure the VirtualIP starts first:

```
# pcs constraint colocation add WebServer with VirtualIP INFINITY
# pcs constraint order VirtualIP then WebServer
```

### Resources

[http://www.linux-ha.org/wiki/Main_Page](http://www.linux-ha.org/wiki/Main_Page)
