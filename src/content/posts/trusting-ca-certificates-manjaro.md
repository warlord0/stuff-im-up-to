---
pubDatetime: 2021-01-17T17:13:21Z
modDatetime: 2021-03-22T20:26:53Z
title: "Trusting CA Certificates (manjaro)"
tags:
  - "certificates"
  - "Linux"
description: "This uses a completely different scheme than Debian. Let's say I have two .crt files (pem format) for intermediate and root certs use the trust program to"
---
This uses a completely different scheme than Debian.

Let's say I have two `.crt` files (pem format) for intermediate and root certs use the `trust` program to import them.

```
sudo trust anchor --store my-intermediate.crt
sudo trust anchor --store my-root.crt
```

It's quite clever, it puts them into `/etc/ca-certificates` and renames them to match the actual name of the certificate.

```
sudo update-ca-trust
```

You can still check your certificates are imported using:

```
awk -v cmd='openssl x509 -noout -subject' '/BEGIN/{close(cmd)};{print | cmd}' < /etc/ssl/certs/ca-certificates.crt
```

## References

[https://wiki.archlinux.org/index.php/User:Grawity/Adding_a_trusted_CA_certificate](https://wiki.archlinux.org/index.php/User:Grawity/Adding_a_trusted_CA_certificate)
