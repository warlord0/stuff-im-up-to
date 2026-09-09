---
pubDatetime: 2020-07-15T17:15:49Z
title: "Keycloak and Nginx"
draft: true
tags:
  - "Uncategorized"
description: "When trying to setup a test system for keycloak on my Ubuntu box I had a few issues getting Nginx installed. Mainly because I already had the Ubuntu versio"
---
When trying to setup a test system for keycloak on my Ubuntu box I had a few issues getting Nginx installed. Mainly because I already had the Ubuntu version installed and that doesn't come with the `ngx_http_js_module` that is needed. For that I have to add the Nginx repository.

After following the guidance on [https://nginx.org/en/linux_packages.html#Ubuntu](https://nginx.org/en/linux_packages.html#Ubuntu) I found that I still couldn't pull the required Nginx with the following error:

```
N: Skipping acquisition of configured file 'nginx/binary-i386/Packages', as repository 'http://nginx.org/packages/ubuntu focal InRelease' doesn't support architecture 'i386'
```

A quick fix of the `/etc/apt/sources.list.d/nginx.list` to add in the required arch was needed.

```
deb [arch=amd64] http://nginx.org/packages/ubuntu focal nginx
```

Following the instructions from [https://docs.nginx.com/nginx/deployment-guides/single-sign-on/keycloak/](https://docs.nginx.com/nginx/deployment-guides/single-sign-on/keycloak/)

Install Nginx and the njs module.

```
sudo apt install nginx nginx-module-njs
```
