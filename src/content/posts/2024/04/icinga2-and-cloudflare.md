---
pubDatetime: 2024-04-28T12:10:41Z
title: "Icinga2 and Cloudflare"
tags:
  - "certificates"
  - "icinga2"
  - "Linux"
  - "Networking"
  - "Security"
heroImage: "/blog-media/2023/11/cloudflare.png"
description: "With Cloudflare, I wanted to host my Icinga2 instance behind a tunnel. This posed a bit of an issue as whenever I tried to submit a passive result the logs"
---
With Cloudflare, I wanted to host my Icinga2 instance behind a tunnel. This posed a bit of an issue as whenever I tried to submit a passive result the logs showed `sslv3 alert bad certificate`.

I figured it's something to do with the Cloudflare TLS getting in the way, and I was right. Between Cloudflare and Icinga2, I need to get Cloudflare to ignore the self-signed certificate of the Icinga2 service. There is a very simple option in the tunnel under TLS that turns off the verification of certificates. With this disabled, I now get correct submissions of passive results.

See also: [Icinga2](/posts/icinga2/)
