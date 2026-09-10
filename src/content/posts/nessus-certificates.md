---
pubDatetime: 2017-02-16T21:10:42Z
title: "Nessus Certificates"
tags:
  - "certificates"
  - "Linux"
  - "Security"
heroImage: "/blog-media/2016/10/nessus-logo-e1475580279964.png"
description: "In order to get your Nessus server to pass a vulnerability scan you'll need to replace the original self-signed cert it uses for its web server. It's easy"
---
In order to get your Nessus server to pass a vulnerability scan you'll need to replace the original self-signed cert it uses for its web server. It's easy enough to do. Generate a CSR and a key for the server:

    $ openssl req -out nessus.csr -new -newkey rsa:2048 -nodes -keyout nessus.key

Open the CSR and use that to get a certificate from your CA. Whilst you're there grab a copy of you CA servers public key. Once you have the certificate (Base64 format) set about copying the key, CA certificate and your new server certificate to where they need to go. Backup the following files first:

- /opt/nessus/var/nessus/CA/serverkey.pem
- /opt/nessus/com/nessus/CA/servercert.pem
- /opt/nessus/com/nessus/CA/cacert.pem

Then replace them with your new key and pem files from your CA and restart the nessus service.

    $ sudo cp ~/nessus.key /opt/nessus/var/nessus/CA/serverkey.pem
    $ sudo cp ~/nessus.pem /opt/nessus/com/nessus/CA/servercert.pem
    $ sudo cp ~/ca.pem /opt/nessus/com/nessus/CA/cacert.pem
    $ sudo service nessusd restart

    References: [https://docs.tenable.com/nessus/6_5/Content/9_Additional_Resources/9_8_Custom_SSL_Certificates.htm](https://docs.tenable.com/nessus/6_5/Content/9_Additional_Resources/9_8_Custom_SSL_Certificates.htm)
