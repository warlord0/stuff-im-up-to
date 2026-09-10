---
pubDatetime: 2024-04-19T09:35:50Z
title: "Knock vs. Knockd"
tags:
  - "Linux"
  - "Security"
  - "ssh"
heroImage: "/blog-media/2020/02/tux-1.png"
description: "I'm working on a project that requires a machine to be contactable on a client's remote network even when its DHCP fails. We've seen an issue where our dev"
---
I'm working on a project that requires a machine to be contactable on a client's remote network even when its DHCP fails. We've seen an issue where our devices disappear periodically. After investigation, we discovered that when the device's DHCP lease expires, it fails to renew its address from the client's DHCP/BOOTP server.

Often the site has a number of devices that have different lease periods, and one device may at least still be online. Now we need to think of a what we can do to use the online device to our advantage to somehow fix, or continue to work with, the offline device. My thinking was to use Avahi's auto IP feature to at least give the offline device an IP address we could then get to from a working device.

\
When I enabled `avahi-daemon` and got `avahi-autoipd` giving the device an IPv4LL address (169.254.0.0/16), I found that `knockd` stopped working. Even though I could see the device has a valid IPv4LL address, and could see knock packets using `tcpdump` on the device, `knockd` wasn't seeing them.

This is going to be a problem. We don't really want the client network to be able to see any ports on the devices, so `knockd` was a good way of making all ports closed unless we need them.

After some investigation, I found that `knockd` is not the only way to use port knocking. You can get `iptables` to handle it for you. [https://wiki.archlinux.org/title/Port_knocking](https://wiki.archlinux.org/title/Port_knocking)

I used this method and set the knock ports as necessary and now, even when the IP changes, the port knock still works.

```
*filter
:INPUT DROP [0:0]
:FORWARD DROP [0:0]
:OUTPUT ACCEPT [0:0]
:TRAFFIC - [0:0]
:SSH-INPUT - [0:0]
:SSH-INPUTTWO - [0:0]
# TRAFFIC chain for Port Knocking. The correct port sequence in this example is  8881 -> 7777 -> 9991; any other sequence will drop the traffic
-A INPUT -j TRAFFIC
-A TRAFFIC -p icmp --icmp-type any -j ACCEPT
-A TRAFFIC -m state --state ESTABLISHED,RELATED -j ACCEPT
-A TRAFFIC -m state --state NEW -m tcp -p tcp --dport 22 -m recent --rcheck --seconds 30 --name SSH2 -j ACCEPT
-A TRAFFIC -m state --state NEW -m tcp -p tcp -m recent --name SSH2 --remove -j DROP
-A TRAFFIC -m state --state NEW -m tcp -p tcp --dport 9991 -m recent --rcheck --name SSH1 -j SSH-INPUTTWO
-A TRAFFIC -m state --state NEW -m tcp -p tcp -m recent --name SSH1 --remove -j DROP
-A TRAFFIC -m state --state NEW -m tcp -p tcp --dport 7777 -m recent --rcheck --name SSH0 -j SSH-INPUT
-A TRAFFIC -m state --state NEW -m tcp -p tcp -m recent --name SSH0 --remove -j DROP
-A TRAFFIC -m state --state NEW -m tcp -p tcp --dport 8881 -m recent --name SSH0 --set -j DROP
-A SSH-INPUT -m recent --name SSH1 --set -j DROP
-A SSH-INPUTTWO -m recent --name SSH2 --set -j DROP
-A TRAFFIC -j DROP
COMMIT
# END or further rules
```

## References

[knockd](https://warlord0blog.wordpress.com/2024/02/04/knockd/)
