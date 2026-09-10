---
pubDatetime: 2024-04-06T14:24:52Z
modDatetime: 2024-04-06T14:26:21Z
title: "Docker and a Local Squid Proxy"
tags:
  - "Docker"
  - "Linux"
  - "proxy"
  - "squid"
heroImage: "/blog-media/2020/01/moby-logo.png"
description: "I've been repetitively building a Docker multi-stage image and found many of the Python requirements are dragging in some pretty large content. This isn't"
---
I've been repetitively building a Docker multi-stage image and found many of the Python requirements are dragging in some pretty large content. This isn't great when the office network isn't particularly fast, and the Docker build stage repeatedly pulls the same files from online.

Time to add a caching proxy.

It would be nice if I can switch the proxy on and off as I need it. I don't necessarily want it system-wide, just to cache the Docker requirements. For this, I can edit the users `~/.docker/config.json` and add in the proxy settings to cache my requests.

Add the Docker image for squid and just run it pretty much as is. Here's my `compose.yml`

```
services:
  squid:
    image: ubuntu/squid
    ports:
      - 0.0.0.0:3128:3128
    environment:
      TZ: Europe/London
    volumes:
      - ./data:/var/spool/squid:rw
      - ./logs:/var/log/squid:rw
```

Now I just point my `~/.docker/config.json` to the proxy. My sample showing the "proxies" stanza added to the config.

```
{
   "auths": {
       "ghcr.io": {
           "auth": "V2UgaGF2ZSBiZWVuIGV4cGVjdGluZyB5b3UgTXIgQm9uZC4K"
       }
   },
   "proxies": {
     "default": {
        "httpProxy": "http://192.168.0.94:3128",
        "httpsProxy": "http://192.168.0.94:3128",
        "noProxy": "*.domain.tld,127.0.0.0/8"
      }
   }  
}
```

Now when Docker build pulls in web content it's via my cache and stops it hammering the slow speed internet so much.

I can even use this proxy in my browser using [SwitchyOmega](https://chromewebstore.google.com/detail/proxy-switchyomega/padekgcemlokbadohgkifijomclgjgif?pli=1) to turn it on and off.
