---
pubDatetime: 2017-01-18T12:13:03Z
modDatetime: 2017-02-06T21:31:26Z
title: "PacketFence Join Domain"
tags:
  - "Linux"
  - "Security"
heroImage: "/blog-media/2016/09/packetfence-e1474622253514.png"
description: "This has caused me a lot of frustration this morning. The new version of PacketFence doesn't like the externally configured domain configuration that I was forced to use when I first set things up."
---
This has caused me a lot of frustration this morning. The new version of PacketFence (v6.4) doesn't like the externally configured domain configuration that I was forced to use when I first set things up. I couldn't get packetfence to join the domain so I editted the configuration files so it was already joined to the domain. This isn't how 6.4 works and you then have to run a script to migrate the external settings into the packetfence database configuration. The script it tells you to run is `/usr/local/pf/addons/AD/migrate.pl` but try as I might this wouldn't work for me. Firstly it's not set as executeable, so I had to call it using:

    $ sudo perl /usr/local/pf/addons/AD/migrate.pl

But then it really messed up the config file /usr/local/pf/conf/domain.conf like this:

    [this
     DOMAIN]
     ad_server=192.168.0.55:749
     workgroup= <

So all sorts of things went wrong. Eventually I just edited that file and corrected it so it looked like this:

    [DOMAIN]
     ad_server=192.168.0.55:749
     workgroup=DOMAIN
     dns_server=192.168.0.55
     bind_pass=
     dns_name=DOMAIN.LOCAL
     bind_dn=username
     server_name=packetfence

Now I could use the Web UI to configure the domain further and get it to join. Well I tried that and the wheels came off again. Test join was failing with because of an "Internal Error". So I tried all kinds of combinations of setting in the domain settings and no luck. Eventually I settled on these settings:

> Workgroup: DOMAIN DNS name of the domain: DOMAIN.LOCAL This servers name: %h Active Directory server: ad.domain.local DNS server: 192.168.0.55 Username: username@domain.local Password: mysecret Allow on registration: unticked

This setting eventually worked! Why eventually? Well after trying a few `net ads status` and like commands I found that kerberos didn't like the fact that the servers time was more than 10 minutes different from the domain servers time! Too big a clock skew! So all that was needed was to install `ntp` and configure it to use our local ntp servers. Once the time had synchronised the domain join succeeded. Now I'm not sure entirely if the settings in /etc/samba/smb.conf and /etc/krb5.conf helped with this as I'm not sure if packetfence uses them. But within them I have setup the domain. **smb.conf**

    [global]

    ## Browsing/Identification ###

    # Change this to the workgroup/NT-domain name your Samba server will part of
    workgroup = DOMAIN

    security = ads
    passdb backend = tdbsam
    realm = DOMAIN.LOCAL
    encrypt passwords = yes
    winbind use default domain = yes
    client NTLMv2 auth = yes
    preferred master = no
    domain master = no
    local master = no
    load printers = no
    log level = 1 winbind:5 auth:3
    winbind max clients = 750
    winbind max domain connections = 15
    winbind separator = +

**krb5.conf**

    [libdefaults]
     default_realm = DOMAIN.LOCAL

    ...

    [realms]

    DOMAIN.LOCAL = {
     kdc = ad.domain.local:88
     admin_server = ad.domain.local:749
     default_domain =DOMAIN.LOCAL
     }


    [domain_realm]

    DOMAIN.LOCAL =DOMAIN.LOCAL
     .DOMAIN.LOCAL =DOMAIN.LOCAL
