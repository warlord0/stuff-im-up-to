---
pubDatetime: 2019-01-03T15:15:08Z
title: "Public Key from Private Key"
tags:
  - "Linux"
  - "Security"
  - "ssh"
heroImage: "/blog-media/2017/02/download-10-e1488295217214.jpg"
description: "I fall over this every so often. I have the private key file but would either have to trawl servers for authorized_keys files to get the public password or"
---
I fall over this every so often. I have the private key file but would either have to trawl servers for authorized_keys files to get the public password or remember how to obtain the public key from the private key.

Time to document it here so I don't have to hunt for it with Google again.

For an RSA PEM format public key

```
$ openssl rsa -in private.key -pubout

-----BEGIN PUBLIC KEY-----
MIIBIDA ...
 -----END PUBLIC KEY-----
```

For an SSH putty friendly version

```
$ ssh-keygen -y -f private.key

 ssh-rsa AAAAB3NzaC1yc2EAAAABJQAAAQE ...
```
