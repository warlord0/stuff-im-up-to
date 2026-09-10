---
pubDatetime: 2023-09-30T07:57:00Z
modDatetime: 2023-10-02T07:10:25Z
title: "Nginx Caching"
tags:
  - "nginx"
  - "Web"
heroImage: "/blog-media/2021/02/nginx_logo.png"
description: "We have a heavily visited service powered by a content management system that gets a huge jump in page visits when an email gets sent out with a PDF link."
---
We have a heavily visited service powered by a content management system that gets a huge jump in page visits when an email gets sent out with a PDF link. The problem is that the CMS is taking all the strain for some static content. We need to change that so when the email goes out and the PDF gets visited, that we cache that on the front end proxy. Then serve it to the next visitors without talking to the backend CMS at all.

Set up a cache on the Nginx reverse proxy for the path `/document/downloads`, but continue serving everything else directly.

With only a few changes to a `default.conf` we can add a cache of 100m called `pearl`. Then enable that cache for the `server {}`. In each location, we can specify how we want things cached using `proxy_cache_valid`.

In the example, we're going to server everything from `/document/download` from a cache if the response is a 200 or 302, for 60 minutes. Now we're not going to bother the backend for an hour once someone takes the first download of the file.

We're also caching the response for 404, just to keep the hammering down if the file does not exist.

For all other `location / {}` we omit the `proxy_cache_valid` entry and no caching will occur.

```
proxy_cache_path /var/cache/nginx keys_zone=pearl:100m;

upstream backend {
    server 192.168.0.222:8081;
}

map $http_upgrade $connection_upgrade {
    default upgrade;
    '' close;
}

server {
    listen 80;
    server_name localhost;

    access_log  /var/log/nginx/host.access.log  main;

    proxy_cache pearl;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $connection_upgrade;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Real-IP $remote_addr;

    location /document/download {
        proxy_cache_valid 200 302 60m;
        proxy_cache_valid 404 1m;

        proxy_pass http://backend;
    }

    location / {
        proxy_pass http://backend;
    }

    #error_page  404              /404.html;

    # redirect server error pages to the static page /50x.html
    #
    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
```

We could get more specific and use location regex's that are based on a file extension like `pdf` or `docx`, but in our case it's safe to say the whole location contains static files. It would be nicer if we could cache based on mime type, as the CMS could be sending any file type, and the extension is not specified as part of the URL or query string.
