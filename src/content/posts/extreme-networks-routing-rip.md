---
pubDatetime: 2017-03-22T08:57:45Z
modDatetime: 2017-04-05T14:47:04Z
title: "Extreme Networks - Routing (RIP)"
tags:
  - "Networking"
description: "Rather than tagging uplink ports with a load of VLAN's and spanning those VLAN's out to every switch you need them spanned out to. Create a separate VLAN a"
---
Rather than tagging uplink ports with a load of VLAN's and spanning those VLAN's out to every switch you need them spanned out to. Create a separate VLAN and IP Scope on each switch (stack) location. Then use a single VLAN subnet (192.168.254.0/24) for routing between locations.

    # create vlan Routing
    # configure vlan Routing tag 1000
    # configure vlan Routing ipaddress 192.168.254.254
    # configure vlan Routing add port 1:46 tagged
    # enable ipforwarding vlan Routing

Add RIP to the Routing VLAN so that when you create VLAN's on the switch they are added to the central routing tables automatically.

    # enable rip
    # enable rip export direct cost 1
    # configure rip add vlan Routing
    # configure rip vlan Routing rxmode v2only

Repeat the same on the edge switches, giving them their own IP address and tagging their uplinks with the Routing VLAN. Then add a default route on the edge switch that points to the core Routing VLAN IP address.

    # configure iproute add default 192.168.254.254

When we create VLAN's on the edge switches (or core) we use a VLAN ID that identifies the subnet too. eg. VLAN ID 20 = 192.168.**20**.0/24.  We also then use that ID for the Routing VLAN IP address on the edge switches.

    # configure vlan Routing ipaddress 192.168.254.20/24

Ad then configure a local VLAN on the edge swtich.

    # create vlan TRUST
    # configure vlan TRUST tag 20
    # configure vlan TRUST ipaddress 192.168.20.254/24
    # enable ipforwarding vlan TRUST

> One caveat on RIP is that in order for rip to send the subnet routing to the core from the edge is that you must have an active device on the subnet. We spent quite some time trying to figure out why rip wasn't receiving the routes from the edge we'd just configured. It was simply because there was no need for a route as no device was active on that subnet. We discovered this by enabling loopback-mode on the VLAN which according to the XOS Command Reference Guide places the VLAN in the UP state without an external active port.

Using the `show rip` command you can see the routes you have received.

    # show rip routes

    Ori Destination     Peer          Mtr State VLAN   Age Next-hop
    >r  192.168.20.0/23 192.168.254.20 2        Routing  3 0.0.0.0 
    >r  192.168.24.0/23 192.168.254.24 2        Routing 26 0.0.0.0

The `>r` shows that the route have been received by rip. A `show iproute` will also show that the routes have been achieved by rip as `#r`.

    # show iproute

    Ori Destination     Gateway       Mtr Flags        VLAN    Duration
    #r  192.168.20.0/23 192.168.254.20 2  UG-D---um--f Routing 187d:3h:59m:31s
    #r  192.168.24.0/23 192.168.254.24 2  UG-D---um--f Routing 111d:13h:38m:8s

### Additional VLAN Settings

Add to the switches the ability to pass DHCP requests to your DHCP server.

    # configure bootprelay add 192.168.0.55 vr VR-Default
    # configure bootprelay add 192.168.0.108 vr VR-Default
    # enable bootprelay vlan TRUST

Additional switch settings to assist with your network setup, like DNS and time servers.

    # configure dns-client add name-server 192.168.0.55 vr VR-Default
    # configure dns-client add name-server 192.168.0.108 vr VR-Default
    # configure dns-client add domain-suffix domain.local 
    # configure sntp-client primary 192.168.0.108 vr VR-Default
    # configure sntp-client secondary 192.168.0.55 vr VR-Default
    # configure sntp-client update-interval 3600 
    # enable sntp-client

### VLAN Naming

One side affect of our using the same vlan names (names, not ID's) across the switches is that our 802.1x RADIUS authentication can send back the name of the VLAN to put the client into. So if the successful response is always TRUST it doesn't matter what IP subnet the client is put on, but it will be put onto whatever IP subnet represents the TRUST VLAN at their location.
