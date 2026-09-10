---
pubDatetime: 2021-04-28T17:51:25Z
title: "Nginx GeoIP"
tags:
  - "Docker"
  - "Linux"
  - "nginx"
heroImage: "/blog-media/2021/02/nginx_logo.png"
description: "With the plus version of Nginx you get access to the compiled version of geoip2 plugin. This means you can use it out of the box just add it into the confi"
---
With the plus version of Nginx you get access to the compiled version of [geoip2](https://docs.nginx.com/nginx/admin-guide/dynamic-modules/geoip2/) plugin. This means you can use it out of the box just add it into the config and away you go. For the rest of us mortals we have to build and compile it ourselves.

This is no slight undertaking as you need to build Nginx to use the dynamic module and download an up to date version of a GeoIP database in the maxmind format.

My usage is going to be inside a docker container that I've already built with [Naxsi](https://github.com/nbs-system/naxsi). Then I'll have a web application firewall built with the ability to filter visitors by their country of origin too.

Even though this is based on a Dockerfile, you can extract from this the means of building this with a non-containerised host.

```
FROM nginx:alpine AS builder

LABEL SPDX-License-Identifier="AGPL-3.0-or-later"

ENV NAXSI_VERSION=1.3

RUN apk add --no-cache --virtual .build-deps \
    gcc \
    geoip-dev \
    git \
    libc-dev \
    libmaxminddb \
    libmaxminddb-dev \
    make \
    openssl-dev \
    pcre-dev \
    python3-dev \
    py3-pip \
    zlib-dev

WORKDIR /usr/local

RUN git clone https://github.com/leev/ngx_http_geoip2_module.git --depth=1 

RUN wget http://nginx.org/download/nginx-${NGINX_VERSION}.tar.gz && \
    mkdir -p /usr/src && \
    tar -zxC /usr/src -f nginx-${NGINX_VERSION}.tar.gz

COPY naxsi-${NAXSI_VERSION} /usr/src/naxsi-${NAXSI_VERSION}

RUN CONFARGS=$(nginx -V 2>&1 | sed -n -e 's/^.*arguments: //p') \
    cd /usr/src/nginx-$NGINX_VERSION && \
    ./configure --with-compat $CONFARGS \
    --add-dynamic-module=/usr/src/naxsi-${NAXSI_VERSION}/naxsi_src/ \
    --add-dynamic-module=/usr/local/ngx_http_geoip2_module/ && \
    make && \
    make modules && \
    make install && \
    mkdir -p /usr/local/nginx/modules/ && \
    cp objs/ngx_http_naxsi_module.so /usr/local/nginx/modules/ngx_http_naxsi_module.so

RUN cd /usr/src/naxsi-${NAXSI_VERSION} && \
    pip install --upgrade pip && \
    cp naxsi_config/naxsi_core.rules /etc/nginx/ && \
    cd nxapi && \
    pip install -r requirements.txt && \
    python3 setup.py install

FROM nginx:alpine

LABEL SPDX-License-Identifier="AGPL-3.0-or-later"

COPY --from=builder  /usr/local/nginx/modules/ngx_http_naxsi_module.so /usr/local/nginx/modules/ngx_http_naxsi_module.so
COPY --from=builder  /usr/local/nginx/modules/ngx_http_geoip2_module.so /usr/local/nginx/modules/ngx_http_geoip2_module.so
COPY --from=builder /etc/nginx/naxsi_core.rules /etc/nginx/naxsi_core.rules

RUN apk add \
    libmaxminddb \
    libmaxminddb-dev
    
RUN mkdir -p /etc/nginx/geoip
COPY dbip-* /etc/nginx/geoip/

COPY nginx.conf /etc/nginx/
COPY default.conf /etc/nginx/conf.d/default.conf

ADD naxsi/naxsi.rules /etc/nginx/naxsi.rules
ADD naxsi/nxapi.json /usr/local/etc/nxapi.json

WORKDIR /usr/share/nginx/html

EXPOSE 8080 8443

VOLUME [ "/usr/share/nginx/html" ]

ENTRYPOINT [ "/usr/sbin/nginx", "-c", "/etc/nginx/nginx.conf" ]
```

- I've put in **bold** the key parts opf the Dockerfile that handle GeoIP.

You need to install the `maxminddb` and `maxminddb-dev` packages. On debian/Ubunto these can be called `maxminddb0` and `maxminddb0-dev`. I included them in the builder, but you'll also need them in the second stage for Nginx to use.

With the database drivers installed we then include the git repo from **[https://github.com/leev/ngx_http_geoip2_module.git](https://github.com/leev/ngx_http_geoip2_module.git)**. The location it's downloaded to gets passed into the Nginx build command as a parameter `--add-dynamic-module=/usr/local/ngx_http_geoip2_module/`

Once Nginx has built in the builder stage we copy the `.so` module file into our Nginx modules location.

You'll need to grab some maxmind GeoIP databases to use. I only want to use the country database, but it even gets as detailed as city if you want it! I got mine from here - the lite version suits my purposes, [https://db-ip.com/db/download/ip-to-country-lite](https://db-ip.com/db/download/ip-to-country-lite)

Copy the extracted database(s) to a location Nginx can use, eg. `/etc/nginx/geoip`

In our Nginx config we now load the module and then specify what database to use to lookup the IP, and what variable contains the IP address to lookup.

The top of my `nginx.conf` looks like this:

```
# user www-data;
worker_processes 4;
pid /run/nginx.pid;
daemon off;

load_module /usr/local/nginx/modules/ngx_http_naxsi_module.so; # load naxsi
load_module /usr/local/nginx/modules/ngx_http_geoip2_module.so; # Load geoip2
```

Then for each of my virtual host config file I include something that looks like this:

```
geoip2 /etc/nginx/geoip/dbip-country-lite-2021-04.mmdb {
    auto_reload 5m;
    $geoip2_metadata_country_build metadata build_epoch;
    $geoip2_data_country_code default=NA source=$remote_addr country iso_code;
    $geoip2_data_country_name country names en;
}

map $geoip2_data_country_code $allowed_country {
    default no;
    GB yes;
}

server {
    listen          8080;
    server_name     virtual.domain.tld;

    location / {
        if ($allowed_country = no) {
            return 403;
        }
```

The geoip2 section sets the db to use and uses the variable `$remote_addr` to lookup the visitors country. If you are running inside another reverse proxy you can use `$http_x_real_ip` if you have already set it as a `proxy_set_header` value.

Now my server will compare the visitors country with my map and if the country is not GB is return a 403 permission denied error.

If I wanted to allow more I could add others like `FR yes; DE yes`, etc.

For debugging I also find it useful to add into the headers return to the clients browser:

```
    add_header X-GEOIP_COUNTRY_CODE $geoip2_data_country_code;
    add_header X-GEOIP_COUNTRY_NAME $geoip2_data_country_name;
    add_header X-REMOTE_ADDR $http_x_real_ip;
```

This way I can inspect what is being discovered using the browsers developer tools.

## References

[https://github.com/leev/ngx_http_geoip2_module](https://github.com/leev/ngx_http_geoip2_module)

[https://db-ip.com/db/download/ip-to-country-lite](https://db-ip.com/db/download/ip-to-country-lite)

[https://maverick9000.github.io/nginx-with-geoip-module/](https://maverick9000.github.io/nginx-with-geoip-module/)
