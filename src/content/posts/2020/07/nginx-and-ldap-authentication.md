---
pubDatetime: 2020-07-11T16:26:56Z
modDatetime: 2023-12-31T17:06:11Z
title: "Nginx and LDAP Authentication"
tags:
  - "ldap"
  - "Linux"
  - "nginx"
  - "Web"
heroImage: "/blog-media/2016/09/2000px-nginx_logo-svg.png"
description: "We want a little more control over some of our reverse proxies and wanted to place a little extra burden on the users as possible. To do this we chose to u"
---
We want a little more control over some of our reverse proxies and wanted to place a little extra burden on the users as possible. To do this we chose to use the same passwords for authentication as we do everywhere else - hence LDAP.

Thankfully, Nginx have decided to include the module `ngx_http_auth_request_module` in both the Nginx Plus and Open Source.

> The prerequisite http_auth_request module is included in both [NGINX Plus packages](https://cs.nginx.com/repo_setup) and [prebuilt NGINX binaries](https://nginx.org/en/linux_packages.html).
>
> [Nginx](https://www.nginx.com/blog/nginx-plus-authenticate-users)

The documentation on implementing this walks you through a reference implementation which can be long winded. I tried to make it simpler with this article.

First clone the source code of the reference model, we only need a few things from it.

```
git clone https://github.com/nginxinc/nginx-ldap-auth.git
```

Build the docker service daemon for the python to LDAP middleware.

```
cd ./nginx-ldap-auth
docker build -t nginx-ldap-auth-daemon .
```

The example runs the docker image standalone, but you could add it into a docker-compose container set either on it's own or with your Nginx service.

```
version: '3.2'

services:
  nginx-ldap-auth:
    image: nginx-ldap-auth-daemon
    ports:
      - "8888:8888"
```

*If it's in the same container as Nginx you don't even need to expose the 8888 port.*

Start the container set:

```
docker-compose up -d
```

All the configuration is done from within your sites `nginx.conf` where ever you use it - `conf.d` or `sites-enabled`. All we need is a `proxy_cache_path` directive in the `http {}` section. Then we add an `auth_request` and `error_page` handler into our `location {}` section. Followed by an `auth-proxy` location with `X-Ldap-` headers for our configuration, eg. in my `sites-enabled/default` file I add the following that relate to our LDAP setup:

```
proxy_cache_path cache/ keys_zone=auth_cache:10m;

server {
  ...
  location / {
    auth_request /auth-proxy;
    error_page 401 =200 /;
    try_files $uri $uri/ =404;
  }

  location = /auth-proxy {
    internal;
    proxy_pass http://localhost:8888;
    proxy_pass_request_body off;
    proxy_set_header Content-Length "";
    proxy_cache auth_cache;
    proxy_cache_valid 200 10m;
    proxy_cache_key "$http_authorization$cookie_nginxauth";
    proxy_set_header X-Ldap-URL "ldap://192.168.0.22";
    proxy_set_header X-Ldap-Starttls "true";
    proxy_set_header X-Ldap-BaseDN   "dc=domain,dc=tld";
    proxy_set_header X-Ldap-BindDN "cn=readonly,dc=domain,dc=tld";
    proxy_set_header X-Ldap-BindPass "SecretKey";
    proxy_set_header X-CookieName "nginxauth";
    proxy_set_header Cookie nginxauth=$cookie_nginxauth;
    proxy_set_header X-Ldap-Template "(uid=%(username)s)";
    #proxy_set_header X-Ldap-Realm    "Restricted";
  }
```

We're using OpenLDAP and the `uid` attribute for username, you may be using `cn` or `sAMAccountName`.

With the docker `nginx-ldap-auth` container running restart/reload Nginx. When you visit your website you should get presented with an authentication dialog.

View the activity of your `nginx-ldap-auth-daemon` from the docker logs using:

```
docker-compose up -d && docker-compose logs -f
```
