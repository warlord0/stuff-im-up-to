---
pubDatetime: 2017-04-25T15:32:04Z
modDatetime: 2017-04-25T15:58:15Z
title: "HTTPS on the Synology NAS"
tags:
  - "Networking"
  - "Privateer"
  - "synology"
  - "Web"
description: "I love this Synology NAS. It's so versatile and immensely capable. I use it for streaming my TV, movies and music. It also acts as my Couchpotato, Sonarr a"
---
I love this Synology NAS. It's so versatile and immensely capable. I use it for streaming my TV, movies and music. It also acts as my Couchpotato, Sonarr and NZBGet system. I think I'll definitely get another when the time comes. But enough glorification. Using the free certificate services from [Let's Encrypt](https://letsencrypt.org/) you can obtain a *FREE* TLS/SSL certificate that you can use on any of your encryption services with the one caveat that it will expire every 3 months. The 3 month expiry isn't so bad. Let's Encrypt provide tools that will automatically renew your certificates either as a command line shell script or a prebuilt package for the likes of 'apt'. With Synology DSM 6 they're released a Web GUI that you can simply enable from the Control Panel, Security, Certificates. How great is that!? Just enter in your FQDN, and email address and any alternative names you have in the SAN's section and submit. Job done!

> In order for Let's Encrypt to verify your FQDN you must have a web service on port 80 that it can get to. A simple bit of port forwarding on your router and it's easy enough to satisfy.

### References

[https://stefandingemanse.nl/how-to-use-lets-encrypt-ssl-certificate-on-synology-dsm/](https://stefandingemanse.nl/how-to-use-lets-encrypt-ssl-certificate-on-synology-dsm/) [https://www.synology.com/en-uk/knowledgebase/DSM/help/DSM/AdminCenter/connection_certificate](https://www.synology.com/en-uk/knowledgebase/DSM/help/DSM/AdminCenter/connection_certificate) [https://letsencrypt.org/](https://letsencrypt.org/)
