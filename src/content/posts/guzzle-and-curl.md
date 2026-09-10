---
pubDatetime: 2019-08-12T11:07:48Z
modDatetime: 2019-08-12T19:35:30Z
title: "Guzzle and Curl"
tags:
  - "Laravel"
  - "Linux"
  - "php"
  - "Web"
  - "Windows"
heroImage: "/blog-media/2016/09/laravel.jpg"
description: "Related to my previous post about Laravel. Guzzle and Nginx I ran into an issue with our proxy. The proxy is always a source of fun and games. Because the"
---
Related to my previous post about [Laravel. Guzzle and Nginx](https://warlord0blog.wordpress.com/2019/08/07/laravel-guzzle-and-nginx/) I ran into an issue with our proxy. The proxy is always a source of fun and games.

Because the proxy breaks open SSL traffic to scan the content the clients are required to have an SSL certificate installed that tells them to trust our proxy server certificate. In Windows and Linux you can insert the CA cert into the OS using group policy or writing it into the certificate store.

Curl uses it's own certificate store so we needed to copy the proxy CA cert into the curl store.

On Windows there wasn't a certificate store. I created one in a location that would remain even if anything was updated or moved.

Download the [`cacert.pem`](https://curl.haxx.se/ca/cacert.pem) file and place it in `c:\certs`. Then I just added my proxy cert in PEM on the end.

```
C:> type proxy.pem >> c:\certs\cacert.pem
```

Edit your `php.ini` and change the curl setting to point at the new `cacert.pem` file

```
[curl]
 curl.cainfo = c:/certs/cacert.pem
```

You can find what php.ini you are using with:

```
C:> php --ini
Configuration File (php.ini) Path: C:\windows
 Loaded Configuration File:         C:\tools\php73\php.ini
 Scan for additional .ini files in: (none)
 Additional .ini files parsed:      (none)
```

Restart any php service, like Apache, Nginx, Artisan, etc. and curl should then trust the proxy server.
