---
pubDatetime: 2023-04-27T16:49:43Z
title: "Adguard or Pihole?"
tags:
  - "dns"
  - "Linux"
  - "Privateer"
  - "Security"
heroImage: "/blog-media/2023/04/adguard_pihole.png"
description: "I guess this could fall under the banner of a privateer project. I'm trying to banish adverts from streaming devices and wanted to see if Adguard or Pihole"
---
I guess this could fall under the banner of a privateer project. I'm trying to banish adverts from streaming devices and wanted to see if [Adguard](https://adguard.com/en/adguard-home/overview.html) or [Pihole](https://pi-hole.net) could help. Both of them operate the same way. They act as a DNS server and when a client makes a request for an address, they check a blocklist and reply with an invalid address `0.0.0.0` if they find the domain listed.

I wanted a system that would sit on a small brick PC I already have, running alongside other network services.

Initially, I installed Pihole. Pretty straight forward to do. I used the ready built a `docker-compose.yml` file and started it up. As a DNS server, I can't fault it, the GUI is nice and informative, but the inability to change the web GUI to any port other than the default 80, is just a no-go for me. I already run a web service (or two) on that port.

Whilst installing Adguard I found that was not a problem. After the docker container set is started, during the installation process, you get to change ports to make it run how you want it.

After being happy at how the DNS side of things worked, I then started it up with DHCP and now use it as my DHCP and DNS services. Everything on my network is now protected by Adguard.

Once you get either system running, you need to find what block lists suit your usage. You can't get much easier than [OSID](https://oisd.nl/howto). Chose the blocker you use, and add the follow the instructions to set the URL into your blocklists.

> If you're reading this blog, and it's awash with adverts - headers, footers and sidebars, be sure that I don't see them. My usage is perfectly clear of them.
