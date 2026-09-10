---
pubDatetime: 2017-04-26T10:50:39Z
modDatetime: 2017-04-26T10:51:35Z
title: "Broken ARP"
tags:
  - "Networking"
  - "Security"
heroImage: "/blog-media/2016/09/juniper.png"
description: "Not a fun morning. We spent an hour or two trying to figure out why our GUEST networks was unable to route any packets to the Internet. For many a GUEST ne"
---
Not a fun morning. We spent an hour or two trying to figure out why our GUEST networks was unable to route any packets to the Internet. For many a GUEST network may be a trivial network, but for us we also us GUEST for unauthenticated devices to access our Virtual Desktop System - primarily including devices that are re-purposed laptops/desktops that no longer require a full Windows PC for domain access and just provide a VMware Horizon Client. So we had a large number of users unable to connect to the back office systems. The strange thing here was that all other network traffic from the trusted networks worked as expected. So maybe we borked the installation of the new UTM and didn't wire it correctly or handle Martians correctly? But why would that only affect GUEST? Taking a look at the arp tables on the internal Juniper firewall showed some strange results.

    SSG(M)-> get arp
    ...
     192.168.69.254 000000000000 trust-vr/eth0/5 VLD 264 0 0 663

Then looking at the arp tables on the UTM showed a matching issue for the other end of that range.

    # arp
    Address HWtype HWaddress Flags Mask Iface
    ...
    192.168.69.1 (incomplete) eth8

So something odd is going on. Clearing the arp caches on both sides I still ended up with this odd entry. I tore down and rebuilt both interfaces on the internal and external firewalls and still no joy. We resisted power cycling the internal firewall as that would then affect other trusted networks that were functional, but eventually had to give in and just hard powered off the internal Juniper firewall and powered it back on. Gave it a minute and all was well in the world once more. I don't think it was anything to do with the arp entry. I think that was just a symptom of the problem. Whatever the problem was this arp entry was borked and no packets would travel through the internal firewalls GUEST interface using any routes including Port Based Routes. A hard reboot, just started all that working again. We then saw the arp entries with valid MAC addresses as expected.

> Moral of this story - "Have you tried turning it off and on again?"
