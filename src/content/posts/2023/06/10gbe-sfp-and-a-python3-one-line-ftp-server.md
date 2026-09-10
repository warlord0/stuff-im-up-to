---
pubDatetime: 2023-06-30T08:05:43Z
title: "10GbE SFP+ and a Python3 One Line FTP Server"
tags:
  - "ftp"
  - "Linux"
  - "Networking"
  - "python"
  - "rsync"
  - "ssh"
heroImage: "/blog-media/2020/02/tux-1.png"
description: "I've built my cluster and stated doing some network tests using iperf3 . My results were pretty good. But my file transfer speeds pretty bad, by comparison"
---
I've built my cluster and stated doing some network tests using `iperf3`. My results were pretty good. But my file transfer speeds pretty bad, by comparison.

The way everything is hooked up is computer nodes have 2 x [802.3ad](https://www.ieee802.org/3/hssg/public/apr07/frazier_01_0407.pdf) bonded 10GbE SFP+ connected to two linked, but separate 10GbE switches. This gives us the resilience we want. Pull a cable or kill a switch and it keeps going.

The storage nodes are similarly bonded, but with 10GbE copper connections.

Using `rsync` to send a 5 GB file between systems seems kinda slow, this makes for an interesting read:

[My Adventure with 10 Gigabit Ethernet and Linux](https://delightlylinux.wordpress.com/2021/01/13/my-adventure-with-10-gigabit-ethernet-and-linux/)

I went out and did some digging around and found using FTP much faster, but more importantly how to temporarily run a simple ftp service, in the same way as the [Python3 One Line Web Server](https://warlord0blog.wordpress.com/2022/09/06/python3-one-line-web-server/).

Install the `pyftpdlib` module using `pip` and run it:

```
sudo apt install python3-pip
python3 -m pip install --user pyftpdlib
python3 -m pyftpdlib --port=2121 --write
```

Install `ftp` on your client and connect to the port 2121 using an anonymous account:

```
$ ftp                                          
ftp> open 192.168.0.21 2121
Connected to 192.168.0.21.
220 pyftpdlib 1.5.7 ready.
Name (192.168.0.21:user): anonymous
331 Username ok, send password.
Password: [anything]
230 Login successful.
Remote system type is UNIX.
Using binary mode to transfer files.
```
