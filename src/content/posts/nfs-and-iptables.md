---
pubDatetime: 2020-03-01T11:07:00Z
modDatetime: 2020-02-29T18:20:02Z
title: "NFS and iptables"
tags:
  - "Linux"
  - "nfs"
heroImage: "/blog-media/2020/02/ubuntu_logo.png"
description: "Continuing with the theme of deploying systems automatically this chapter deals with using an NFS share to hold your iso images. The problem I faced was th"
---
Continuing with the theme of deploying systems automatically this chapter deals with using an NFS share to hold your iso images.

The problem I faced was the Ubuntu system I was hosting the iso's on comes ready prepared with an iptables firewall. This denied my attempts to view or mount the nfs share from a client.

Sorting out NFS through the firewall is a little tricky as the services NFS provides use a dynamic port. This makes it impossible to handle through a port based firewall - unless we tie the services down to use a specific port.

The key to this is reading a very old document on the Debian wiki, which is even referenced in the files we need to edit - [http://wiki.debian.org/SecuringNFS](http://wiki.debian.org/SecuringNFS)

### /etc/default/nfs-common

Add specific ports to be used to STATDOPTS, `"--port 32765 --outgoing-port 32766"`

```
# If you do not set values for the NEED_ options, they will be attempted
# autodetected; this should be sufficient for most people. Valid alternatives
# for the NEED_ options are "yes" and "no".


# Options for rpc.statd.
#   Should rpc.statd listen on a specific port? This is especially useful
#   when you have a port-based firewall. To use a fixed port, set this
#   this variable to a statd argument like: "--port 4000 --outgoing-port 4001".
#   For more information, see rpc.statd(8) or http://wiki.debian.org/SecuringNFS
STATDOPTS="--port 32765 --outgoing-port 32766"

# Do you want to start the gssd daemon? It is required for Kerberos mounts.
NEED_GSSD=
```

### /etc/default/nfs-kernel-server

Add a specific port to RPCMOUNTDOPTS, `--port 32767`

```
# Number of servers to start up
RPCNFSDCOUNT=8

# Runtime priority of server (see nice(1))
RPCNFSDPRIORITY=0

# Options for rpc.mountd.
# If you have a port-based firewall, you might want to set up
# a fixed port here using the --port option. For more information, 
# see rpc.mountd(8) or http://wiki.debian.org/SecuringNFS
# To disable NFSv4 on the server, specify '--no-nfs-version 4' here
RPCMOUNTDOPTS="--manage-gids --port 32767"

# Do you want to start the svcgssd daemon? It is only required for Kerberos
# exports. Valid alternatives are "yes" and "no"; the default is "no".
NEED_SVCGSSD=""

# Options for rpc.svcgssd.
RPCSVCGSSDOPTS=""
```

You'll have to restart the NFS server after the changes:

```
$ sudo systemctl restart nfs-server.service
```

Rpcinfo should then show you the ports things are listening on are now static:

```
$ sudo rpcinfo -p
program vers proto port service
100000 4 tcp 111 portmapper
100000 3 tcp 111 portmapper
100000 2 tcp 111 portmapper
100000 4 udp 111 portmapper
100000 3 udp 111 portmapper
100000 2 udp 111 portmapper
100005 1 udp 32767 mountd
100005 1 tcp 32767 mountd
100005 2 udp 32767 mountd
100005 2 tcp 32767 mountd
100005 3 udp 32767 mountd
100005 3 tcp 32767 mountd
100003 3 tcp 2049 nfs
100003 4 tcp 2049 nfs
100227 3 tcp 2049
100003 3 udp 2049 nfs
100227 3 udp 2049
100021 1 udp 33488 nlockmgr
100021 3 udp 33488 nlockmgr
100021 4 udp 33488 nlockmgr
100021 1 tcp 35675 nlockmgr
100021 3 tcp 35675 nlockmgr
100021 4 tcp 35675 nlockmgr
```

Now you need to allow those ports through the firewall. The easiest way I found was to install the GUI Firewall Configuration tool from the Ubuntu repository:

```
$ sudo apt install firewall-config
```

Under the "Permanent" configuration for the "public" zone I selected the following services on the Services tab:

```
mountd, nfs, nfs3, rpc-bind
```

Then added the port I chose to the Ports tab as both tcp and udp.

```
32767 | tcp
32767 | udp
```

From my client system I can then see and mount my NFS shares:

```
$ showmount -e 192.168.0.22
Export list for 192.168.0.22:
/home/iso 192.168.0.0/16
$ sudo mount -t nfs 192.168.0.22:/home/iso /mnt/iso
```

This now means I can proceed with using NFS for the home of my iso's for my automated deployment project.
