---
pubDatetime: 2017-07-04T14:52:30Z
modDatetime: 2018-08-22T15:36:19Z
title: "OpenVPN DNS"
tags:
  - "Linux"
  - "Networking"
  - "openvpn"
heroImage: "/blog-media/2016/09/openvpntech_logo1.png"
description: "Using OpenDNS on a Linux system that uses resolv.conf requires that the OpenVPN script is able to update the DNS servers sent by the remote dhcp options. T"
---
Using OpenDNS on a Linux system that uses resolv.conf requires that the OpenVPN script is able to update the DNS servers sent by the remote dhcp options. To do this you must amend your OpenVPN config file to include the following lines.

    script-security 2
    up /etc/openvpn/update-resolv-conf
    down /etc/openvpn/update-resolv-conf

Then when you establish your connection your DNS search domain and servers will be added successfully. References: [https://airvpn.org/topic/9608-how-to-accept-dns-push-on-linux-systems-with-resolvconf/](https://airvpn.org/topic/9608-how-to-accept-dns-push-on-linux-systems-with-resolvconf/) [https://github.com/masterkorp/openvpn-update-resolv-conf](https://github.com/masterkorp/openvpn-update-resolv-conf)
