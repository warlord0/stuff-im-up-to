---
pubDatetime: 2017-07-20T09:49:57Z
modDatetime: 2017-07-20T09:56:28Z
title: "SSH - no matching key exchange method"
tags:
  - "Linux"
heroImage: "/blog-media/2016/09/debian-logo-1.png"
description: "Trying to logon to some older network switch management interfaces I came across a failure due to them using older SHA1 key exchanges and key types. Thankf"
---
Trying to logon to some older network switch management interfaces I came across a failure due to them using older SHA1 key exchanges and key types. Thankfully OpenSSH supports some legacy options to get around this, at least until we get the switches replaced or upgraded.

    $ ssh admin@192.168.10.1
    Unable to negotiate with 192.168.10.1 port 22: no matching key exchange method found. Their offer: diffie-hellman-group1-sha1

Add the option to use DH-G1-SHA1

    $ ssh -oKexAlgorithms=+diffie-hellman-group1-sha1 admin@192.168.10.1
    Unable to negotiate with 192.168.10.1 port 22: no matching host key type found. Their offer: ssh-dss

So now add the ability to use the host key type ssh-dss:

    $ ssh -oKexAlgorithms=+diffie-hellman-group1-sha1 -oHostKeyAlgorithms=+ssh-dss admin@192.168.10.1

Now we're on!   References: [https://www.openssh.com/legacy.html](https://www.openssh.com/legacy.html)
