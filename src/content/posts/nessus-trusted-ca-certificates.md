---
pubDatetime: 2016-10-04T11:21:48Z
title: "Nessus Trusted CA Certificates"
tags:
  - "certificates"
  - "Linux"
  - "Security"
description: "It's that time again. Scanning for vulnerabilities means keeping certificates up to date. After updating our CA certificate to SHA-256 and KSP we now need"
---
It's that time again. Scanning for vulnerabilities means keeping certificates up to date. After updating our CA certificate to SHA-256 and KSP we now need to tell Nessus to trust the new certificate. So after doing the obvious and adding it to the Linux server trusted CA certificates the scan still failed to trust the new certificate. This is because Nessus uses it's own certificate repository. It's a simple text file /opt/nessus/lib/nessus/plugins/custom_CA.inc To add the new cert just `cat` it into it.

    $ sudo cat public_key.crt >> /opt/nessus/lib/nessus/plugins/custom_CA.inc
