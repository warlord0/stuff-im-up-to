---
pubDatetime: 2018-03-27T12:38:07Z
modDatetime: 2018-03-27T12:42:59Z
title: "Access DFS Shares from Linux"
tags:
  - "debian"
  - "Linux"
  - "Windows"
heroImage: "/blog-media/2016/09/debian-logo-1.png"
description: "I've kicked this around a few times and resigned myself to just using the non-DFS path to attach to. But we've recently changed some of the servers around"
---
I've kicked this around a few times and resigned myself to just using the non-DFS path to attach to. But we've recently changed some of the servers around and the paths have changed - obviously the DFS paths haven't. So I thought I'd have a go at fixing the problem. SMB is obviously working as I can connect to the share using the traditional path `//servername/sharename`. But when trying to use the DFS version `//domain.local/shares/sharename` it would fail to find the share. This post provided the answer to my problems: [http://mattslay.com/connecting-ubuntu-to-windows-shares-and-dfs-trees/](http://mattslay.com/connecting-ubuntu-to-windows-shares-and-dfs-trees/) I added `wins` into my `/etc/nsswitch.conf`:

    hosts: files wins dns mdns4_minimal [NOTFOUND=return]

I know, I'm not using wins, we don't have wins, but let's go there. Then I edited my `/etc/samba/smb.conf` and added/amended some wins details under the `[global]` section. Using one of the domain controllers as the IP address.

    wins server = 192.168.0.55
    name resolve order = host wins bcast

Finally changed the `-c` option in `/etc/request-key.conf` to `-t` on the `cifs.spnego` line.:

    create cifs.spnego * * /usr/sbin/cifs.upcall -t %kcreate cifs.spnego * * /usr/sbin/cifs.upcall -t %k

Now I can connect to the DFS path using the GUI file manager `smb://domain.local/shares/sharename` or using the command line to mount the share.

    $ sudo mount -t cifs //domain.local/shares/sharename /mnt/sharename --verbose -o username=myuser,vers=2.0
