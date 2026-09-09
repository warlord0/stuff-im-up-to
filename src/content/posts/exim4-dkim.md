---
pubDatetime: 2016-10-08T16:15:59Z
modDatetime: 2016-10-13T08:16:31Z
title: "Exim4 & DKIM"
tags:
  - "dkim"
  - "exim4"
  - "Linux"
  - "smtp"
description: "Where possible I try to get mail systems setup so that they can be verified as true senders by the recipient by using SPF and DKIM. Seems a shame that few"
---
Where possible I try to get mail systems setup so that they can be verified as true senders by the recipient by using SPF and DKIM. Seems a shame that few mail systems actually seem to do this as it would trim a lot of spam from the net. Having moved to another server I needed to move the mail sender with it. This particular system only needs to send email out as there is another system that receives mail for this domain. So All I need do is install an SMTP service and make sure it signs it's messages with the same private key as I previously used, so it matches the public key that is published in DNS. Previously the system used Postfix and OpenDKIM, but as this needs to be a barebones simple system I figured I'd stick with Debian's default mailer Exim4. Turns out this was a good choice as it has DKIM built in. After building the server I was surprised to find out that it actually had no mail service installed at all! I've almost always encountered Exim on a new install and replaced it with Postfix and Dovecot. So first thing I need to do is install Exim4.

    $ sudo apt-get install mailutils

This installs exim4 and a few other mail helper programs. *I ended up installing exim4-daemon-heavy as I initially struggled to get exim to sign messages, but after resolving my problem I found I probably would have been fine using the default light daemon. But if you're after anti-spam or malware services, exim4-daemon-heavy is needed.* The thing that tripped me over was a simple mistake, compounded by lack of experience with exim. Turns out that the exim config files can either be used as one single config file, or as separated config files in conf.d style folders. So here's me editing the separate conf.d files to setup the DKIM settings, only to find no messages getting signed no matter what I changed. Once I realised all I need to do is edit the single config file `/etc/exim4/exim4.conf.template` and restart the service, signatures appeared in my messages. So if you have installed exim4 as above it will be using a single config file by default. So edit `/etc/exim4/exim4.conf.template` and place the following into a section that'll you'll need to create "transport/00_exim4-config_local-macros" as shown in this snippet:

    ...
    ### main/00_local_macros
    #################################

    #DKIM
    DKIM_CANON = relaxed
    DKIM_SELECTOR = myselector
    DKIM_DOMAIN = domain.net
    DKIM_FILE = /etc/exim4/dkim/domain.net.pem
    DKIM_PRIVATE_KEY = ${if exists{DKIM_FILE}{DKIM_FILE}{0}}
    ...

If you later configure exim to use separate files just drop this into the `/etc/exim4/conf.d/main/00_local_macros` file instead. To check or change the style of config you are using edit the file `/etc/exim4/update-exim4.conf.conf` (yes two .conf's if correct), and look for the line `dc_use_split_config` which will either be true or false. Alternatively use the following to reconfigure exim4 with a text GUI.

    $ sudo dpkg-reconfigure exim4-config

Make sure you copy your domain.net.pem file into the /etc/exim4/dkim folder (which you will have to create) and grant read permission to the Debian-exim user.

    $ sudo mkdir /etc/exim4/dkim
    $ sudo cp domain.net.pem /etc/exim4/dkim
    $ sudo chown :Debian-exim -R /etc/exim4/dkim

Restart exim4

    $ sudo systemctl restart exim4.service

You can get a look at you running config using:

    $ sudo exim -bP

and you can pipe it through grep it' you're looking for something specific. Further reading: [https://debian-administration.org/article/718/DKIM-signing_outgoing_mail_with_exim4](https://debian-administration.org/article/718/DKIM-signing_outgoing_mail_with_exim4) [Exim4, DKIM & Smarthost](https://warlord0blog.wordpress.com/2016/10/13/exim4-dkim-smarthost/)
