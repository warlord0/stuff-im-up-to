---
pubDatetime: 2023-11-06T18:32:26Z
modDatetime: 2023-11-06T18:33:24Z
title: "Certbot and Cloudflare"
tags:
  - "certificates"
  - "Networking"
  - "Web"
heroImage: "/blog-media/2021/01/ssl.png"
description: "I decided to move my DNS servers onto Cloudflare so that I could use certbot and DNS updates, rather than a web root. This is something I prefer to do to a"
---
I decided to move my DNS servers onto Cloudflare so that I could use certbot and DNS updates, rather than a web root. This is something I prefer to do to allow me to use externally generated certificates on an internal network, without publishing the DNS records to the outside world.

Why do I do this? I can have secure services inside my LAN using valid certificates, whilst keeping my internal network addresses out of the public eye.

I can use addresses like `server1.domain.tld` on the inside, but not have a DNS record externally for it. As long as I can dynamically update my DNS server with a token supplied by certbot, I can get Let's Encrypt to issue a valid certificate for it.

Create a credentials file, `cloudflare.ini`, somewhere certbot can access, and make sure it is only readable by root, eg. `chmod u+rw,go= /etc/letsencrypt/credentials/cloudflare.ini`

Now, there is a quirk with certbot. It requires the **Global API key,** NOT a user API token. This threw me a bit. If you're getting an error similar to this:

```
Error determining zone_id: 6003 Invalid request headers. Please confirm that you have supplied valid Cloudflare API credentials. (Did you copy your entire API token/key? To use Cloudflare tokens, you'll need the python package cloudflare>=2.3.1. This certbot is running cloudflare 2.12.4)
```

Then you are probably using the wrong API key. The entries in you credential file should look something like this:

```
dns_cloudflare_email=user.name@domain.tld
dns_cloudflare_api_key=SuperSecretKey
```

Now you can call certbot to get your certificate. Don't forget to use `--dry-run` to prevent any failures from blocking you, until you are confident it works.

```
certbot certonly --config "/etc/letsencrypt.ini" \
  --work-dir "/tmp/letsencrypt-lib" --logs-dir "/tmp/letsencrypt-log" \
  --cert-name "dash" --agree-tos \
  --email "user.name@domain.tld" \
  --domains "server1.domain.tld" \
  --authenticator dns-cloudflare \
  --dns-cloudflare-credentials "/etc/letsencrypt/credentials/cloudflare.ini" \
  --dry-run
```

I also set up a `letsencrypt.ini` to specify some defaults.

```
text = True
non-interactive = True
webroot-path = /tmp/letsencrypt-acme-challenge
key-type = ecdsa
elliptic-curve = secp384r1
preferred-chain = ISRG Root X1
```

## Nginx Proxy Manager

I discovered the API issue when I was using Nginx Proxy Manager. By default, it enters the wrong variable name in the parameters when you choose to get it to get a certificate using DNS, and Cloudflare. It automatically put in `dns_cloudflare_api_token=` when what is actually required is `dns_cloudflare_api_key=` as above (with email address).

See also [Nginx Proxy Manager and GoAccess](https://warlord0blog.wordpress.com/2023/10/10/nginx-proxy-manager-and-goaccess/)
