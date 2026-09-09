---
pubDatetime: 2022-02-18T17:15:05Z
title: "Exim4 and TLS Issues"
tags:
  - "email"
  - "exim4"
  - "Linux"
  - "smtp"
description: "How difficult can this be? Same server config, just want to enable TLS so it finally has STARTTLS support. Well it looks easy enough as you just need to dr"
---
How difficult can this be? Same server config, just want to enable TLS so it finally has STARTTLS support. Well it looks easy enough as you just need to drop in some certificates under the default location `/etc/exim4/exim.crt` and `exim.key`. Restart the server and see in the `mainlog`:

> Warning: No server certificate defined; TLS connections will fail.\
> Suggested action: either install a certificate or change tls_advertise_hosts option

We start tearing into the config in `/etc/exim4/conf.d` and `grep` through it finding lots of references to `CONFDIR/exim.crt` and `CONFDIR/exim.key`, so we must have things in the right place - why is it not finding them? Permissions - we `chmod` to the max a still no joy, check the ownership is correct, nope.

## What is it?

Exim gives out a really odd error here. It suggests it can't find the certs and will use self-signed certificates, so it must have TLS enabled? **No** - it does not!

Add a file into the config:

#### /etc/exim4/conf.d/main/01_tls

```
# Enable STARTTLS
MAIN_TLS_ENABLE = yes
```

Restart exim, and now we see no warning in the logs and TLS is now available. It's not the end of the story, but it cleared up the strange error message. Why report you're going to use self-signed certificates if you aren't even going to use TLS?

Next we expanded the options to include:

```
# Enable STARTTLS
MAIN_TLS_ENABLE = yes

tls_on_connect_ports = 465
auth_advertise_hosts = ${if eq {$tls_cipher}{}{}{*}}
```

This means we now support TLS on TCP port 465, and STARTTLS on port 25 and 587 - if we have configured exim to listen on those ports. To enable listening on 465, 25, and 587 modify the `default` file and restart exim:

#### /etc/default/exim4

```
SMTPLISTENEROPTIONS='-oX 465:25:587 -oP /var/run/exim4/exim.pid'
```

## Why do you Need Port 465 if you Have STARTTLS?

Because all the Apple devices we've come across do not support STARTTLS and the only way they can have TLS is using the dedicated TLS port - it doesn;t have to be 465, but that's what the port is as registered with IANA - ([submissions](https://www.iana.org/assignments/service-names-port-numbers/service-names-port-numbers.xhtml?search=465))
