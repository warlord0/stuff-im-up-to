---
pubDatetime: 2020-02-22T10:41:41Z
modDatetime: 2020-02-22T10:42:21Z
title: "Docker on Ubuntu eoan"
tags:
  - "Docker"
  - "Linux"
description: "The installation on eoan fails with a missing dependency for containerd.io not having an install candidate. Fix Edit your /etc/apt/sources.list file and ch"
---
The installation on eoan fails with a missing dependency for `containerd.io` not having an install candidate.

### Fix

Edit your `/etc/apt/sources.list` file and change the `eoan` version to `disco`. Or remove the line and re-add it using:

```
$ sudo add-apt-repository \
   "deb [arch=amd64] https://download.docker.com/linux/ubuntu \
   disco \
   stable"
```

It may still fail to install with an error `docker.service Failed with result 'start-limit-hit'.` A reboot soon sorted it out followed by a call to `apt install`.

```
$ apt install -f
```
