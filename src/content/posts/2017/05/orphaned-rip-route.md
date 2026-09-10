---
pubDatetime: 2017-05-10T08:11:30Z
modDatetime: 2017-05-10T08:15:00Z
title: "Orphaned RIP Route"
tags:
  - "Networking"
heroImage: "/blog-media/2017/03/extreme.jpg"
description: "After making some changes to the way our network was setup I ran into a problem with RIP. We started out with a VLAN spanning a pair of switches and using"
---
After making some changes to the way our network was setup I ran into a problem with RIP. We started out with a VLAN spanning a pair of switches and using a tagged uplink port to connect and span the two. This worked fine, but with the new design favouring routing I thought we'd take the opportunity to change the configuration. As the edge switch was being replaced it was easy enough to just rebuild the new switch and configure it for [RIP](https://warlord0blog.wordpress.com/2017/03/22/extreme-networks-routing-rip/). But on the core switch it meant I needed to delete the VLAN that would no longer be needed. This is what stopped me in my tracks. Deleting a VLAN is easy. I just used

    # delete vlan MYVLAN

And it was removed from the configuration. But, I should have been more complete in my VLAN removal and removed the IP address from it first! Because I didn't remove the IP Address when I look at the RIP routes I still see the old route, but assigned to an `unknown` VLAN.

    # show rip routes 

    Ori  Destination      Peer     Mtr State VLAN       Age Next-hop       
    ...
    >d   192.168.69.0/24  0.0.0.0  1         unknown    0   192.168.69.254    

Try as I might I cannot get rid of this orphan. This means that after adding the new switch and creating the VLAN and RIP config, RIP does not update the route on the core switch. I tried recreating the VLAN on the core and giving it the same VID and IP address. Then removing and still the route remained. The only way to get rid of it seems to be to reboot the core switch, which I'm very reluctant to do as that'll take everything down.

> So before you remove a VLAN, remove the IP Address first!

    # unconfigure vlan MYVLAN ipaddress
    # delete vlan MYVLAN
