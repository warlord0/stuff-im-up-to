---
pubDatetime: 2016-10-10T20:51:57Z
title: "Comodo SSL Certs & Android"
tags:
  - "android"
  - "certificates"
  - "Linux"
  - "nginx"
  - "ssl"
description: "After buying a cheap SSL certificate I found I'd missed something important during the install. Usually it's just a case of copy the certificate and key fi"
---
After buying a cheap SSL certificate I found I'd missed something important during the install. Usually it's just a case of copy the certificate and key files to /etc/ssl/certs and /etc/ssl/private, respectively and then pointing the Nginx config at them to get it working. Well all was well in the GUI world of Linux and Windows browsers. But My Android said the certificate wasn't trusted. Looks like there's some CA intermediates that need sorting. When I got the certificate from Cheap SSL Security it came with a bunch of other certificates in the zip file that I pretty much ignored. Well all I needed to do was bundle them into a single file that I'd already configured Nginx to use and restart Nginx.

    $ sudo cat www_mydomain_com.crt COMODORSADomainValidationSecureServerCA.crt COMODORSAAddTrustCA.crt AddTrustExternalCARoot.crt > /etc/ssl/certs/www.mydomain.com.pem
    $ sudo systemctl restart nginx.service

I was pointed to a pretty useful site that showed me that my certificate was installed, but there were some issues. Follow the link below to check your certificate setup is complete. Check out your SSL Certs here: [https://www.networking4all.com/en/support/tools/site+check/](https://www.networking4all.com/en/support/tools/site+check/)
