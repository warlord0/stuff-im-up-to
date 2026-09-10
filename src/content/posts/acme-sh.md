---
pubDatetime: 2021-04-14T21:24:30Z
modDatetime: 2021-04-19T06:57:27Z
title: "acme.sh"
tags:
  - "certificates"
  - "Linux"
heroImage: "/blog-media/2021/01/ssl.png"
description: "We've been using certbot and Let's Encrypt for years. But we have some legacy systems hidden in the bowels and darkest corners or our data centre that are"
---
We've been using certbot and Let's Encrypt for years. But we have some legacy systems hidden in the bowels and darkest corners or our data centre that are no longer supported by certbot. Certbot uses python, on some creaky old systems we just can't upgrade them to continue using certbot. This is where [acme.sh](https://github.com/acmesh-official/acme.sh) comes in.

> Purely written in Shell with no dependencies on python or the official Let's Encrypt client.

When installed it sits under the users home folder in `~/.acme.sh`. The install process creates an alias so you should just be able to use it as `acme.sh`.

The key to configuring it is understanding that your settings get saved in `~/.acme.sh/account.conf`. When you make calls to be issued a certificate your credentials will get stored in here.

As we're using the DNS api to get certs the DNS key etc. need to be added to our config. We need to add in the location of our key file from the DNS server. The TSIG will be place in a root only readable file `/etc/certbot-key` the location of which is stored in the `account.conf` file, eg.

```
SAVED_NSUPDATE_SERVER='dns.domain.tld'
SAVED_NSUPDATE_SERVER_PORT='53'
SAVED_NSUPDATE_KEY='/etc/certbot-key'
SAVED_NSUPDATE_ZONE=''
```

We're using it mainly with Nginx and I'd like to keep the behaviour as similar to certbot as possible. Download the certs and place them in `/etc/acme.sh/sub.domain.tld/` as `privkey.pem` and `fullchain.pem`. Then my `nginx.conf` will be very similar, eg.

```
server {
  listen 443 ssl http2;
  server_name sub.domain.tld;

  ssl_certificate         /etc/acme.sh/sub.domain.tld/fullchain.pem;
  ssl_certificate_key     /etc/acme.sh/sub.domain.tld/privkey.pem;
  ssl_trusted_certificate /etc/acme.sh/sub.domain.tld/fullchain.pem;
...
}
```

Obtain the certificate using:

```
    mkdir -p /etc/acme.sh/sub.domain.tld
    ~/.acme.sh/acme.sh --issue \
        --dns dns_nsupdate \
        --log /tmp/acme.log \
        --key-file       /etc/acme.sh/sub.domain.tld/privkey.pem  \
        --fullchain-file /etc/acme.sh/sub.domain.tld/fullchain.pem \
        --reloadcmd      "nginx -t && systemctl reload nginx" \
        -d "sub.domain.tld"
```

This will create the necessary DNS TXT record and call Let's Encrypt to test and issue a certificate. The certs are placed under `~/acme.sh`, but the `--key-file` and `--fullchain-file` instruct acme.sh to copy the files into the specified location. Then the `--reloadcmd` ensure the nginx config is tested and nginx is reloaded on a successful test.

The good part is that you don't need to have root access to run acme.sh. The only need is for you to be able to write into the path where you want the certificates copied and hosted from.

If all goes to plan, install the cron job so the certificates will be renewed:

```
acme.sh --install-cronjob
```

There is no `--dry-run` so make use of `--staging` and `--force` flags to make calls to the staging server so as not to hit the live servers throttle limits whilst testing.
