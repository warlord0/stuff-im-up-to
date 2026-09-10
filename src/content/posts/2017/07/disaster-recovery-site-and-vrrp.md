---
pubDatetime: 2017-07-31T09:41:53Z
title: "Disaster Recovery Site and VRRP"
tags:
  - "Networking"
heroImage: "/blog-media/2017/03/extreme.jpg"
description: "We're currently working at putting in a new SIP based phone system that is externally hosted. As we already have a disaster recovery (DR) site with a netwo"
---
We're currently working at putting in a new SIP based phone system that is externally hosted. As we already have a disaster recovery (DR) site with a network that routes out to it we figured we'd host the backup link for the phone system out there too. The phone provider has installed 2 routers for us, one locally and the other at the DR site. They've then configured their routers to handle failovers using some active technology like BGP or VRRP. We don't know the specifics and that really doesn't matter to us. As long as we can route traffic out to them to their gateway address, then the rest is up to us to handle. At our end we need to make sure that we can give them a single routable gateway address for their return traffic to follow. This means that our routable IP address must migrate between our live site and the DR site depending upon which is currently active. When the situation is normal our routable IP needs to be at the home site, when the home site fails or the live link to the phone system fails it needs to move the IP over to the DR  site. Using VRRP to achieve this on the Extreme switches is very easy. In essence you create a VLAN that spans both switches. Then you give your master site the routable IP you need to use, assign a VRRP priority to that master switch of 255. Then repeat the same kind of process without a priority for the backup site. The basic instructions from Extreme are here: [https://gtacknowledge.extremenetworks.com/articles/How_To/How-to-create-a-basic-VRRP-configuration](https://gtacknowledge.extremenetworks.com/articles/How_To/How-to-create-a-basic-VRRP-configuration) This doesn't cover the full creation of the VLAN to span between two switches. To complete that process you must ensure that you add the uplink ports between the switches into the VRRP VLAN as tagged. Example where ports 1:48 on each switch is used as an uplink between the two. The address that will move between the switches is 192.168.2.254.

### Master Switch

    create vlan Transit tag 1002
    configure vlan Transit add port 1:48 tagged
    configure vlan Transit ipaddress 192.168.2.254/24
    create vrrp vlan Transit vrid 1
    configure vrrp vlan Transit vrid 1 priority 255
    configure vrrp vlan Transit vrid 1 add 192.168.2.254
    enable vrrp

### Backup Switch

    create vlan Transit tag 1002
    configure vlan Transit add port 1:48 tagged
    configure vlan Transit ipaddress 192.168.2.253/24
    create vrrp vlan Transit vrid 1
    configure vrrp vlan Transit vrid 1 add 192.168.2.254
    enable vrrp

You'll probably want to enable IP forwarding for the Transit VLAN's too and may then need to add routes to the remote phone system to the switches to actually pass traffic. eg. In the following example the remote network is 10.0.1.0/24 and the phone system routers share an IP address of 192.168.2.252.

    enable ipforwarding vlan Transit
    configure iproute add 10.0.1.0/24 192.168.2.252
