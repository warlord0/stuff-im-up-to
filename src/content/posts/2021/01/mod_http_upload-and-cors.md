---
pubDatetime: 2021-01-22T20:38:38Z
modDatetime: 2023-04-21T17:46:38Z
title: "mod_http_upload and CORS"
tags:
  - "ejabberd"
  - "Linux"
  - "Security"
  - "xmpp"
heroImage: "/blog-media/2021/01/ejabberd1.png"
description: "Putting together a container set with movim and ejabberd I ran into CORS (Cross Origin Resource Sharing). I'm using the default upload url https://@HOST@/u"
---
Putting together a container set with [movim](https://movim.eu) and ejabberd I ran into CORS (Cross Origin Resource Sharing).

I'm using the default upload url `https://@HOST@/upload` where the host is simply `domain.tld` and the movim url is `movim.domain.tld`. This is in fact documented as a need to do this, but for some reason it wasn't going to plan.

I think what was going on was a number of things that prevented this from working, CORS and file permissions on my upload folder.

Here's the relevant snippets from my config to solve the CORS issue.

```
  -
    port: 5443
    ip: "::"
    module: ejabberd_http
    tls: true
    request_handlers:
      /admin: ejabberd_web_admin
      /api: mod_http_api
      /bosh: mod_bosh
      /captcha: ejabberd_captcha
      /upload: mod_http_upload
      /ws: ejabberd_http_ws
      /oauth: ejabberd_oauth  
    custom_headers:
      "Access-Control-Allow-Origin": "*"
      "Access-Control-Allow-Methods": "OPTIONS, HEAD, GET, PUT"
      "Access-Control-Allow-Headers": "Authorization"
      "Access-Control-Allow-Headers": "Content-Type, Origin, X-Requested-With"
      "Access-Control-Allow-Credentials": "true" 
```

For a belt and braces approach I included the headers in the `mod_http_upload` too.

```
  mod_http_upload:
    name: HTTP File Upload
    access: local
    max_size: 104857600 # 100 MiB.
    file_mode: "0640"
    dir_mode: "2750"
    # docroot: /var/www/upload/@HOST@ # This needs to exists and be writable default: /home/ejabberd/upload
    put_url: https://@HOST@:5443/upload
    custom_headers:
      "Access-Control-Allow-Origin": "*"
      "Access-Control-Allow-Methods": "OPTIONS, HEAD, GET, PUT"
      "Access-Control-Allow-Headers": "Authorization"
      "Access-Control-Allow-Headers": "Content-Type, Origin, X-Requested-With"
      "Access-Control-Allow-Credentials": "true" 
    thumbnail: false
```

To resolve the file permissions I went into the container and used `chown/chmod`:

```
docker-compose exec ejabberd sh
chown ejabberd:ejabberd upload -R
chmod u+rw,g+rw,o-rw upload -R
```

The default location for uploads in `/home/ejabberd/upload` because I exec into the container as the user `ejabberd` the `upload` folder is right there. I have mounted it as a volume so it's persistent.
