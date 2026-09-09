---
pubDatetime: 2016-09-22T09:06:20Z
modDatetime: 2018-10-24T18:22:20Z
title: "Trusting CA Certificates"
tags:
  - "certificates"
  - "Linux"
  - "ssl"
description: "This is something that catches me out regularly. Adding our CA certificate onto a Linux server. Just so it can trust the interactions of LDAP over a secure channel. It's pretty straightforward to do but bites me almost every time. The secret seems to be make sure you CA certificate is in PEM format and named with a .crt extension. A .pem or .cer extensions just doesn't cut it."
---
This is something that catches me out regularly. Adding our CA certificate onto a Linux server. Just so it can trust the interactions of the LDAP over a secure channel. It's pretty straightforward to do but bites me almost every time. The secret seems to be make sure your CA certificate is in PEM format and named with a .crt extension. A .pem or .cer extension just doesn't cut it. Copy your certificate into the /usr/share/local/ca-certificates folder and update the CA certificates:

    $ sudo cp my-ca-certificate.crt /usr/local/share/ca-certificates/
    $ sudo update-ca-certificates

If you got it right you should see something like:

    Updating certificates in /etc/ssl/certs... 1 added, 0 removed; done.
    Running hooks in /etc/ca-certificates/update.d....
    Adding debian:my-ca-certificate.pem
    done.
    done.

Which seems very odd considering it's a .crt file, but the response reports .pem. If you got it wrong, you won't get any response from update-ca-certificates. You can check it appears in the trusted CA certificates list using:

    $ awk -v cmd='openssl x509 -noout -subject' '/BEGIN/{close(cmd)};{print | cmd}' < /etc/ssl/certs/ca-certificates.crt

You'll get a huge list returned and hopefully you'll see your CA listed at the end.
