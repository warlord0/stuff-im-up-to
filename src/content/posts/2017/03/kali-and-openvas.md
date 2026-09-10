---
pubDatetime: 2017-03-04T17:06:41Z
modDatetime: 2017-03-04T17:08:13Z
title: "Kali and OpenVAS"
tags:
  - "Networking"
  - "Security"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "In house we use Nessus to scan for vulnerabilities, but that's a commercial subscription based product. It's not expensive, but it's not something I want t"
---
In house we use Nessus to scan for vulnerabilities, but that's a commercial subscription based product. It's not expensive, but it's not something I want to pay for outside of the office. I'd still like to do some vulnerability scanning of our own external IP addresses. So thought I'd take a look at OpenVAS. Installing it in Kali is pretty easy. Just a regular `apt-get install openvas` process. It's a significant install coming in at nearly 1.5GB. Then you run the `openvas-setup` program and off it goes updating all the plugins for the first time. It's going to take a while... so go grab a coffee. Just make sure you keep an eye out for the password that is generated at the end of the process. You'll need that to logon to the admin interface on `https://localhost:9392` when the install is complete. eg.

    User created with password '6062d074-0a4c-4de1-a26a-5f9f055b7c88'.

You can change this once you get into the Web UI. Start OpenVas

    # openvas-start

   

## References

[https://www.kali.org/penetration-testing/openvas-vulnerability-scanning/](https://www.kali.org/penetration-testing/openvas-vulnerability-scanning/) [http://www.openvas.org](http://www.openvas.org)
