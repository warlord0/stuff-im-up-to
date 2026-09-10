---
pubDatetime: 2022-11-08T12:41:08Z
title: "Nginx Container with Custom Modules"
tags:
  - "Linux"
  - "nginx"
  - "Web"
heroImage: "/blog-media/2021/02/nginx_logo.png"
description: "The dev team wanted a version of Nginx that included some custom modules. I've previously built custom Nginx on bare metal, but this time it wanted to be i"
---
The dev team wanted a version of Nginx that included some custom modules. I've previously built custom Nginx on bare metal, but this time it wanted to be in docker.

To build the required modules, you need to compile them using a tarball Nginx. But I don't necessarily want to run a custom Nginx just to run the modules. As Nginx now uses dynamic modules, I can use an Nginx tarball to compile the modules, but then use an off the shelf built version of Nginx to load my modules into. The only thing I need to be sure of is to build the modules using the same version of Nginx that I am going to run the modules with.

The module required in this case is [`ngx_http_replace_filter_module`](https://github.com/openresty/replace-filter-nginx-module). This has a prerequisite of [`sregex`](https://github.com/openresty/sregex). The following methodology can be adapted for any module that requires compilation for use with Nginx.

The Dockerfile is a multistage build. First, I make an Nginx container that has the Nginx tarball and build tools to compile the modules. Then the seconds stage is to use a pre-built Nginx image and copy the compiled assets from the `builder` container into my pre-built Nginx container.

By using a multistage build like this, I dispose of all the unnecessary build tools that aren't required at runtime. All I want is the compiled assets, not the cruft I used to compile them.

#### Dockerfile

```
FROM debian:bullseye-slim AS builder

ENV NGINX_VERSION 1.23.2

RUN apt update && \
    apt install -y \
    build-essential \
    curl \
    git \
    libpcre++-dev \
    zlib1g-dev

RUN curl http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz -o /tmp/nginx-${NGINX_VERSION}.tar.gz && \
    cd /tmp && \
    tar xvzf nginx-${NGINX_VERSION}.tar.gz

RUN git clone https://github.com/openresty/sregex.git /tmp/sregex && \
    cd /tmp/sregex && \
    make && \
    make install

RUN git clone https://github.com/openresty/replace-filter-nginx-module.git /tmp/replace-filter-nginx-module && \
    cd /tmp/nginx-${NGINX_VERSION} && \
    ./configure --with-compat --add-dynamic-module=/tmp/replace-filter-nginx-module && \
    make modules

FROM nginx:1.23.2

COPY --from=builder /tmp/nginx-${NGINX_VERSION}/objs/* /etc/nginx/modules/

COPY --from=builder /usr/local/lib/* /lib/x86_64-linux-gnu/
```

You can see it's a pretty straightforward task. Build the module and dependency, and copy them to a fresh Nginx. Then all I need to do is modify the `nginx.conf` to load my module:

#### nginx.conf

```
load_module modules/ngx_http_replace_filter_module.so;

user  www-data;
worker_processes  auto;

error_log  /var/log/nginx/error.log notice;
pid        /var/run/nginx.pid;

events {
    worker_connections  1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    log_format  main  '$remote_addr - $remote_user [$time_local] "$request" '
                      '$status $body_bytes_sent "$http_referer" '
                      '"$http_user_agent" "$http_x_forwarded_for"';

    access_log  /var/log/nginx/access.log  main;

    sendfile        on;
    client_max_body_size 1000M;

    #tcp_nopush     on;

    keepalive_timeout  65;

    #gzip  on;

    include /etc/nginx/conf.d/*.conf;
}
```
