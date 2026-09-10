---
pubDatetime: 2016-01-04T07:30:49Z
modDatetime: 2016-09-19T13:54:24Z
title: "Linux Firewall"
tags:
  - "firewall"
  - "iptables"
  - "Linux"
  - "Security"
heroImage: "/blog-media/2016/09/debian-logo-1.png"
description: "Arno is a manager for the iptables firewall. It's pretty easy to setup and configure for the straightforward rules you need. Install it using eth0 as your"
---
Arno is a manager for the iptables firewall. It's pretty easy to setup and configure for the straightforward rules you need. Install it using eth0 as your external interface if you only have one NIC

    # apt-get install arno-iptables-firewall

Make Changes after you've installed it.

    # dpk-reconfigure arno-iptables-firewall

To customise your rules and make them more relevant to your network and hosts

    #  vi /etc/arno-iptables-firewall/conf.d/00debconf.conf

The important bits are around OPEN_TCP. This will open your ports for everyone who visits. To restrict them use HOST_OPEN_TCP

    HOST_OPEN_TCP="192.168.0.0/24,192.168.1.0/24~22 192.168.0.0/24,192.168.1.0/24~80 192.168.0.0/24,192.168.1.0/24~10000"
    OPEN_TCP="3128"
    OPEN_UDP=""

HOST_OPEN_TCP uses host address or network address, comma separated and a tilde before the port number. So 192.168.0.0/24,192.168.1.0/24~22 means 192.168.0.0/24 and192.168.1.0/24 can access port 22. Restart arno using

    # arno-iptables-firewall restart

You can check the settings are live using

    # iptables-save | less

 

### Webmin

If using webmin then it will control the rules rather than arno. When you first use it webmin will ask you to save the rules. They will be placed in /etc/iptables.up.rules To update webmin after you make changes in the arno config

    # iptables-save > /etc/iptables.up.rules
