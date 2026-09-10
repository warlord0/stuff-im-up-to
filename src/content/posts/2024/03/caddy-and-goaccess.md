---
pubDatetime: 2024-03-16T12:38:51Z
title: "Caddy and GoAccess"
tags:
  - "caddy"
  - "Linux"
  - "Web"
heroImage: "/blog-media/2024/03/caddy_logo.png"
description: "GoAccess is a great Nginx log file analyser that I was using with Nginx Proxy Manager. Wouldn't it be great to carry on using it with Caddy?"
---
GoAccess is a great Nginx log file analyser that I was using with Nginx Proxy Manager. Wouldn't it be great to carry on using it with Caddy?

Caddy has a log formatting module that you can use to format the log output into the same as the "combined" format used by Nginx and Apache. This means All I need to is change the config for the goaccess format to "COMBINED" and set the output to a folder within my caddy webserver.

## GoAccess

#### goaccess.conf (stripped of comments)

```
time-format %T
date-format %d/%b/%Y
log-format COMBINED
config-dialog false
hl-header true
json-pretty-print false
no-color false
no-column-names false
no-csv-summary false
no-progress false
no-tab-scroll false
with-mouse false
real-time-html true
ws-url wss://sub.domain.tld:443/ws
log-file /var/log/caddy/sub.domain.tld.log
agent-list false
with-output-resolver false
http-method yes
http-protocol yes
output /usr/share/caddy/html/access/index.html
no-query-string false
no-term-resolver false
444-as-404 false
4xx-to-unique-count false
all-static-files false
double-decode false
enable-panel GEO_LOCATION
ignore-crawlers false
crawlers-only false
unknowns-as-crawlers false
ignore-panel REFERRERS
ignore-panel KEYPHRASES
real-os true
static-file .css
static-file .js
static-file .jpg
static-file .png
static-file .gif
static-file .ico
static-file .jpeg
static-file .pdf
static-file .csv
static-file .mpeg
static-file .mpg
static-file .swf
static-file .woff
static-file .woff2
static-file .xls
static-file .xlsx
static-file .doc
static-file .docx
static-file .ppt
static-file .pptx
static-file .txt
static-file .zip
static-file .ogg
static-file .mp3
static-file .mp4
static-file .exe
static-file .iso
static-file .gz
static-file .rar
static-file .svg
static-file .bmp
static-file .tar
static-file .tgz
static-file .tiff
static-file .tif
static-file .ttf
static-file .flv
static-file .dmg
static-file .xz
static-file .zst
geoip-database /usr/share/GeoIP/GeoIP.mmdb
```

## Caddy

Install the caddy transform encoder module as detailed here: [https://github.com/caddyserver/transform-encoder](https://github.com/caddyserver/transform-encoder)

Configure caddy to output the logs in `Caddyfile` and configure the webserver to serve the output `index.html` and proxy goaccess websocket.

#### Caddyfile

Taken from the caddy transform decoder [documentation](https://github.com/caddyserver/transform-encoder).

This will output combined format log files for all web servers where you use `import` the `sub-domain `config.

```
{
    servers :443 {
        name myServerName
    }
}

(subdomain-log) {
    log {
        format transform `{request>remote_ip} - {user_id} [{ts}] "{request>method} {request>uri} {request>proto}" {status} {size} "{request>headers>Referer>[0]}" "{request>headers>User-Agent>[0]}"` {
            time_format "02/Jan/2006:15:04:05 -0700"
        }
        hostnames {args[0]}
        output file /var/log/caddy/{args[0]}.log
    }
}

import /etc/caddy/conf.d/*
```

#### conf.d/mysite.conf

This should add a path `/access` to your site and serve web sockets for real-time updates from the goaccess service.

Add the following into your site config.

```
  handle /access/* {
    root * /usr/share/caddy/html/access
    try_files * /index.html
    file_server
  }

  reverse_proxy /ws {
    to 127.0.0.1:7890
  }

  import subdomain-log sub.domain.tld
```

## References

[https://github.com/caddyserver/transform-encoder](https://github.com/caddyserver/transform-encoder)
