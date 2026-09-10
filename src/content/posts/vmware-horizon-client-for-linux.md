---
pubDatetime: 2016-10-21T11:26:15Z
modDatetime: 2016-10-21T11:27:45Z
title: "VMWare Horizon Client for Linux"
tags:
  - "Linux"
  - "vmware"
heroImage: "/blog-media/2016/10/vmware-logo-eps-vector-image-800x533-e1476948729563.png"
description: "That was an interesting challenge. A colleague was trying to install the VMWare Horizon Client into Linux without any real Linux experience. I know that in"
---
That was an interesting challenge. A colleague was trying to install the VMWare Horizon Client into Linux without any real Linux experience. I know that installing things into Linux isn't as cut and dried as running a setup program in Windows, but VMWare really don't help themselves by making this easy for Linux noobs. The actual install runs a .bundle file script which does carry out the install fairly seamlessly, but when it finishes it turns out that it looks for some older dependencies than are available on the flavour of Linux being used. How's a Linux noob supposed to understand that? Run the installation bundle as an administrator:

    $ sudo sh ./VMware-Horizon-Client-4.2.0-4329640.x64.bundle

This will run a GUI installer (or text if the bundle doesn't support your environment) and prompt you for the bits you want to install. I don't want much, just the Multi-media Redirection - the USB and microphone etc. are all an unnecessary hindrance to me so I untick them. As it finishes it can scan and start services, but will likely fail on some dependencies, as shown here: ![screenshot-from-2016-10-21-120755](/blog-media/2016/10/screenshot-from-2016-10-21-120755.png) My failure is only for libffi.so.5, but that's only because I unticked most of the options. I did notice on my colleagues environment (Elementary) that it also failed on libudev.so.0. This simply means it can't find these libraries on the system. This isn't strictly true as the libraries are there, but the software is looking for a specific version which is older than the one installed. Why it's so specific I don't know. But to fix it is a simple case of linking the current newer version to the name of the older one it's looking for to fool it into using it. You can close the installer as it's job is complete, but we now have to sort out those failures. Interestingly enough on my Debian 8 system (cinnamon) although it showed this failure when I ran vmware-view it just worked anyhow. But to fix it on my colleagues system I used:

    $ sudo ln -s /usr/lib/x86_64-linux-gnu/libffi.so.6 /usr/lib/x86_64-linux-gnu/libffi.so.5
    $ sudo ln -s /lib/x86_64-linux-gnu/libudev.so.1 /lib/x86_64-linux-gnu/libudev.so.0

Run vmware-view and good as new.
