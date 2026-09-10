---
pubDatetime: 2024-03-13T21:12:17Z
title: "caddy"
tags:
  - "caddy"
  - "Linux"
  - "Networking"
  - "proxy"
  - "Web"
heroImage: "/blog-media/2024/03/caddy_logo.png"
description: "Caddy is a \"server of servers\", but probably more recognised as a reverse proxy or web server. It's memory safe, so likely to gain traction because of the"
---
Caddy is a "server of servers", but probably more recognised as a reverse proxy or web server.

It's memory safe, so likely to gain traction because of the recent call for memory safe software development.

It seems easy to get going, but gave me some challenges. It's HTTPS out of the box and will handle creating or obtaining certificates to satisfy the domain you are serving. Which means it handles the ACME calls to the likes of Let's Encrypt to get a certificate, without needing certbot.

This post is aimed at being a simple how to get it going guide. There's clearly more to do, but once you have it running ad getting a certificate you can then step it up.

## Install caddy

```
pamac install caddy-cloudflare
```

This pulls in `xcaddy` to handle the use and build of plugins.

## Cloudflare DNS

I wanted to try it out using Cloudflare's DNS and the caddy plugin. This is where it got tricky. But I find it always does, and one article says to use a Cloudflare token, another an API key. When I used the API key that I was using for certbot, I found it returned an error 6003. Which I now know means you're using the wrong sort of key/token.

First, I went to Cloudflare and into my profile and into "API Tokens". For caddy, I needed to create a "Token" that would be allowed to edit a specific DNS zone. I then copied the token (it's a one time display, so keep it safe).

## A Brief Config

Create a `Caddyfile` to configure a simple reverse proxy to localhost port 3004.

```
subdomain.domain.tld {
    reverse_proxy 127.0.0.1:3004

    tls {
        dns cloudflare {$CLOUDFLARE_API_KEY}
        resolvers 1.1.1.1
    }
}
```

Start the caddy service. You will need `sudo` because we are starting the service on protected ports 80, 443.

```
sudo CLOUDFLARE_API_KEY=SuperSecretKey caddy run
```

If you got it right, it will start the service and go fetch a certificate.

Because we used `sudo`, the configuration and certificates get stored in `/root/.local/share/caddy`

## References

<https://samjmck.com/en/blog/using-caddy-with-cloudflare>
