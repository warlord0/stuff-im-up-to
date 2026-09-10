---
pubDatetime: 2023-10-09T19:07:08Z
title: "certbot and upnp"
tags:
  - "Linux"
  - "Security"
  - "Web"
heroImage: "/blog-media/2021/01/ssl.png"
description: "I don't tend to open port 80 to the outside world on my home system. I have no need of an unsecured, unencrypted web service. For this reason, getting a ce"
---
I don't tend to open port 80 to the outside world on my home system. I have no need of an unsecured, unencrypted web service. For this reason, getting a certificate from certbot, when I don't have access to update DNS, means using the ACME web server to validate certificate requests.

In order to get a certificate, I can call UPnP to open port 80, make the request, and call UPnP to close the port when I'm done.

Install the python module `miniupnpc` and the very simple scripts below get called before and after the certificate is fetched.

Using a python script to open port 80:

#### /etc/letsencrypt/renewal-hooks/pre/01-upnp

```
#!/usr/bin/env python3
import miniupnpc
import os
u = miniupnpc.UPnP()
u.discoverdelay = 30
u.discover()
u.selectigd()
u.addportmapping(80, 'TCP', u.lanaddr, 80, 'acme', '')
```

Script to close the port:

#### /etc/letsencrypt/renewal-hooks/post/01-upnp

```
#!/usr/bin/env python3
import miniupnpc
import os
u = miniupnpc.UPnP()
u.discoverdelay = 30
u.discover()
u.selectigd()
u.deleteportmapping(80, 'TCP')
```

Making the call for a certificate:

```
sudo certbot --agree-tos -m support@domain.tld certonly --pre-hook=/etc/letsencrypt/renewal-hooks/pre/01-upnp --post-hook=/etc/letsencrypt/renewal-hooks/post/01-upnp -d sub.domain.tld
```

If I already have Nginx handling the port 80 service, that includes something like:

```
# http -> https
server {
  listen 80;
  server_name *.domain.tld;
 
  location ~ /.well-known {
      allow all;
  }
 
  rewrite ^(.*) https://$host$1 permanent;
}
```

Then specify the path as our document root, eg. `/usr/share/nginx/html`.

If I am using the standalone web service that certbot provides, it should work out of the box - as long as nothing else is listening on port 80.

Check the renewal file, and you should find it uses the authenticator type you selected, eg. `webroot` and a map to the folder to look for the requests in. But more importantly, it remembers the pre- and post-hooks.

```
$ cat /etc/letsencrypt/renewal/sub.domain.tld.conf

# renew_before_expiry = 30 days
version = 2.6.0
archive_dir = /etc/letsencrypt/archive/sub.domain.tld
cert = /etc/letsencrypt/live/sub.domain.tld/cert.pem
privkey = /etc/letsencrypt/live/sub.domain.tld/privkey.pem
chain = /etc/letsencrypt/live/sub.domain.tld/chain.pem
fullchain = /etc/letsencrypt/live/sub.domain.tld/fullchain.pem

# Options used in the renewal process
[renewalparams]
account = 71226484b962b7dfacdae85743389b67
pre_hook = /etc/letsencrypt/renewal-hooks/pre/01-upnp
post_hook = /etc/letsencrypt/renewal-hooks/post/01-upnp
authenticator = webroot
server = https://acme-v02.api.letsencrypt.org/directory
key_type = ecdsa
[[webroot_map]]
sub.domain.tld = /usr/share/nginx/html
```
