---
pubDatetime: 2017-07-17T15:05:52Z
modDatetime: 2017-07-17T15:07:03Z
title: "VMware Horizon Client on Debian Stretch"
tags:
  - "horizon"
  - "Linux"
  - "vmware"
description: "In order to install the client on Debian 9 (stretch) I've had to get libpng12-0 installed from Jessie here: https://packages.debian.org/en/jessie/amd64/lib"
---
In order to install the client on Debian 9 (stretch) I've had to get libpng12-0 installed from Jessie here: [https://packages.debian.org/en/jessie/amd64/libpng12-0/download](https://packages.debian.org/en/jessie/amd64/libpng12-0/download) Then had to create symbolic link for `libffi.so.5` to the newer version that's installed.

    $ sudo ln -s /usr/lib/x86_64-linux-gnu/libffi.so.5 /usr/lib/x86_64-linux-gnu/libffi.so.6

  References: [https://communities.vmware.com/thread/545364](https://communities.vmware.com/thread/545364)
