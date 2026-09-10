---
pubDatetime: 2023-10-10T20:55:59Z
modDatetime: 2023-11-06T18:34:12Z
title: "Nginx Proxy Manager and GoAccess"
tags:
  - "Docker"
  - "Linux"
  - "nginx"
  - "Web"
heroImage: "/blog-media/2023/10/npm.png"
description: "Nginx proxy Manager (NPM) is a simple-to-use management interface for the Nginx reverse proxy. It handles the Let's Encrypt certificates with ease. GoAcces"
---
[Nginx proxy Manager](https://nginxproxymanager.com) (NPM) is a simple-to-use management interface for the Nginx reverse proxy. It handles the Let's Encrypt certificates with ease.

GoAccess is a very effective Nginx log file analyser - in real time. Wouldn't it be great to get them working together?

GoAccess just needs to be familiar with the format of the log file, and it will produce very pretty real time output of your stats. The problem was getting the log format correct. That was until I came across this script: [https://github.com/stockrt/nginx2goaccess](https://github.com/stockrt/nginx2goaccess)

You take the format of the log file output as used in the NPM `nginx.conf` and pass it to the script. It returns all you need to put into the `goaccess.conf` to inform it of your log format.

```
$ ./nginx2goaccess.sh '[$time_local] $upstream_cache_status $upstream_status $status - $request_method $scheme $host "$request_uri" [Client $remote_addr] [Length $body_bytes_sent] [Gzip $gzip_ratio] [Sent-to $server] "$http_user_agent" "$http_referer"'

- Generated goaccess config:

time-format %T
date-format %d/%b/%Y
log_format [%d:%t %^] %^ %^ %s - %m %^ %v "%U" [Client %h] [Length %b] [Gzip %^] [Sent-to %^] "%u" "%R"
```

I paste in the command output and restart goaccess and I get wonderful statistics.

## Serving via Stats NPM

For extra credit I decided I wanted to serve my stats through NPM. For this I had to get creative. I have a website being served already. What I need to do is add two custom locations to my NPM site.

`/stats` - this needs to point at a simple web service hosting the report output HTML file.

`/ws` - this is used to point at the goaccess web sockets port on 7890.

For the `/stats` I wanted small and light - I used this [https://lipanski.com/posts/smallest-docker-image-static-website](https://lipanski.com/posts/smallest-docker-image-static-website) It's ready to pull down as a docker file and turn into a compose like this:

#### docker-compose.yml

```
version: '3.7'

services:
  web:
    image: lipanski/docker-static-website
    volumes:
      - "${PWD}/static:/home/static:ro"
    ports:
      - 3000:3000
```

Create an empty config file in `static` with:

```
touch static/httpd.conf
```

I then set the output of goaccess to put the file into the folder as `static/index.hml`. Set the scheme, hostname and port in the NPM custom location for `/stat` to `http`, `192.168.0.123/`, `3009`. Notice the trailing `/` on the hostname, it's important.

For the `/ws` I did a similar location using scheme, hostname and port to `http`, `192.168.0.123/`, `7890`.

In my `goaccess.conf` I have:

```
ws-url wss://sub.domain.tld:443/ws
```

This is written into the `index.html` file output and allows the static file to dynamically update by calling a web socket.

## References

See also [Certbot and Cloudflare](https://warlord0blog.wordpress.com/2023/11/06/certbot-and-cloudflare/)

[https://nginxproxymanager.com](https://nginxproxymanager.com)

[https://goaccess.io](https://goaccess.io)

[https://forums.unraid.net/topic/103977-view-nginx-proxy-manager-access-logs-in-a-beautiful-dashboard-with-goaccess/](https://forums.unraid.net/topic/103977-view-nginx-proxy-manager-access-logs-in-a-beautiful-dashboard-with-goaccess/)

[https://github.com/stockrt/nginx2goaccess](https://github.com/stockrt/nginx2goaccess)

[https://lipanski.com/posts/smallest-docker-image-static-website](https://lipanski.com/posts/smallest-docker-image-static-website)
