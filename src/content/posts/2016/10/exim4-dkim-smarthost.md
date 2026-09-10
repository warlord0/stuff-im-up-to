---
pubDatetime: 2016-10-13T08:10:37Z
modDatetime: 2016-10-13T08:17:42Z
title: "Exim4, DKIM & Smarthost"
tags:
  - "dkim"
  - "exim4"
  - "Linux"
  - "smtp"
heroImage: "/blog-media/2016/09/debian-logo-1.png"
description: "Following on from the previous post Exim4 & DKIM I ran into a problem with no DKIM signature being added to outgoing mail. As I had this working when sendi"
---
Following on from the previous post [Exim4 & DKIM](/posts/exim4-dkim/) I ran into a problem with no DKIM signature being added to outgoing mail. As I had this working when sending emails directly I figure it has to do with the smarthost config in Exim4. Turns out the problem is that there is no DKIM config in the smarthosts config section. The section we're looking for is `remote_smtp_smarthost:` which if you search for in the exim4.conf.template file shows as being within transport/30_exim4-config_remote_smtp_smarthost, so the corresponding separate config file would be under conf.d/transport. I then set about coying the DKIM related parts from the `smtp_remote:` section into the `remote_smtp_smarthost:` section:

    .ifdef DKIM_DOMAIN
    dkim_domain = DKIM_DOMAIN
    .endif
    .ifdef DKIM_SELECTOR
    dkim_selector = DKIM_SELECTOR
    .endif
    .ifdef DKIM_PRIVATE_KEY
    dkim_private_key = DKIM_PRIVATE_KEY
    .endif
    .ifdef DKIM_CANON
    dkim_canon = DKIM_CANON
    .endif
    .ifdef DKIM_STRICT
    dkim_strict = DKIM_STRICT
    .endif
    .ifdef DKIM_SIGN_HEADERS
    dkim_sign_headers = DKIM_SIGN_HEADERS
    .endif

As I was correcting this I decided to go back to putting the DKIM variables back into the `/etc/exim4/conf.d/main/00_local_macros` file or section at the top of the `/etc/exim4/exim4.conf.template` file. After updating the config and restarting the service sent messages then started getting a DKIM signature header.
