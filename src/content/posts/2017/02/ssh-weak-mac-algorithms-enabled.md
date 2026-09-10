---
pubDatetime: 2017-02-15T21:16:47Z
modDatetime: 2017-02-16T21:48:39Z
title: "SSH Weak MAC Algorithms Enabled"
tags:
  - "Linux"
  - "Security"
  - "ssh"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "OpenSSH_6.0p1 Edit /etc/ssh/sshd_config add or amend the following: Ciphers aes128-ctr,aes192-ctr,aes256-ctr MACs hmac-sha1,hmac-ripemd160"
---
### OpenSSH_6.0p1

Edit /etc/ssh/sshd_config add or amend the following:

    Ciphers aes128-ctr,aes192-ctr,aes256-ctr
    MACs hmac-sha1,hmac-ripemd160
