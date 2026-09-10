---
pubDatetime: 2024-05-03T16:57:54Z
title: "Cloudflare Warp on Linux"
tags:
  - "cloudflare"
  - "Linux"
  - "Networking"
heroImage: "/blog-media/2023/11/cloudflare.png"
description: "After installing the Cloudflare Warp client on my Manjaro system, I could not get it to connect. Watching the journal, I found this: INFO main_loop: warp::"
---
After installing the Cloudflare Warp client on my Manjaro system, I could not get it to connect.

Watching the journal, I found this:

```
INFO main_loop: warp::warp_service: WARP status: Unable(ConnectivityCheckFailed(DNSLookupFailed))
```

And the client shows unable to connect due to DNS lookup faliure.

It has to be a systemd resolv issue, and a quick search revealed a post on [Reddit](https://www.reddit.com/r/CloudFlare/comments/12yrbkz/comment/joy2dx0/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button).

Edit the file `/etc/systemd/resolve.conf` and set the parameter `ResolveUnicastSingleLabel=yes` then restart the `systemd-resolv` service.

```
sudo systemctl restart systemd-resolv.service
```

On a side note: Checking the log suggests it's a WireGuard VPN.

```
DEBUG tunnel_loop{protocol="wireguard"}
```
