---
pubDatetime: 2020-04-16T11:26:00Z
modDatetime: 2020-04-16T11:26:54Z
title: "Asterisk + WebRTC"
tags:
  - "asterisk"
  - "Linux"
  - "nginx"
description: "Enable WebRTC so you can use a plain old HTML5 browser to make calls. I had already configured Asterisk's http server to use my Let's Encrypt certificates."
---
Enable WebRTC so you can use a plain old HTML5 browser to make calls.

I had already configured Asterisk's http server to use my Let's Encrypt certificates. This was pretty much redundant for http usage as I always put systems behind an Nginx reverse proxy where I can.

#### http.conf

```
[general]
servername=pbx.domain.tld
enabled=yes
bindaddr=0.0.0.0
bindport=8088
tlsenable=yes            ; enable tls - default no.
tlsbindaddr=0.0.0.0:8089 ; address and port to bind to - default is bindaddr and port 8089.
tlscertfile=/etc/asterisk/keys/fullchain1.pem ; path to the certificate file (*.pem) only.
tlsprivatekey=/etc/asterisk/keys/privkey1.pem ; path to private key file (*.pem) only.
```

#### /etc/nginx/conf.d/asterisk.conf

Snippets added into the `nginx.conf` to proxy to the asterisk `/ws` path.

Note the use of the non-https port for the upstream asterisk.

```
upstream asterisk {
  server 127.0.0.1:8088;
}
server {
  ...
  location /ws {
    proxy_buffers 8 32k;
    proxy_buffer_size 64k;
    proxy_pass http://asterisk/ws;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header Host $http_host;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
    proxy_read_timeout 999999999;
  }
}
```

#### pjsip.conf

```
[transport-wss]
type=transport
protocol=wss
bind=0.0.0.0
```

#### ps_aors

Set the `max_contacts` to 5

#### ps_endpoints

Set `dtls_auto_generate_cert` to `yes`, `webrtc` to `yes`

## References

[https://wiki.asterisk.org/wiki/display/AST/Configuring+Asterisk+for+WebRTC+Clients](https://wiki.asterisk.org/wiki/display/AST/Configuring+Asterisk+for+WebRTC+Clients)

[https://wiki.asterisk.org/wiki/display/AST/WebRTC+tutorial+using+SIPML5](https://wiki.asterisk.org/wiki/display/AST/WebRTC+tutorial+using+SIPML5)

[https://www.bidon.ca/fr/notes/asterisk-webrtc](https://www.bidon.ca/fr/notes/asterisk-webrtc)
