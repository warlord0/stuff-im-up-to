---
pubDatetime: 2017-10-31T12:02:13Z
title: "JunOS static-nat and proxy-arp"
tags:
  - "juniper"
  - "Networking"
heroImage: "/blog-media/2016/09/juniper.png"
description: "I'm still relatively new to this JunOS, even though it's been installed for several months now. Today's problem was not passing traffic through a new stati"
---
I'm still relatively new to this JunOS, even though it's been installed for several months now. Today's problem was not passing traffic through a new static-nat that I'd setup. I checked the config for static-nats that already existed and couldn't see the problem. I needed to look at how the static-nat gets presented on the interface. It's no good having a NAT rule if you don't actively acknowledge that you are active on that IP address on an interface. No proxy-arp means nothing gets passed to NAT because the IP doesn't exist on the network. To do this make sure you add a proxy-arp address on the interface that you want to access the IP address. eg.

    set security proxy-arp interface reth1.99 address 192.168.99.99/32

Then you'll have a related `rule` entry in your `security nat static rule-set` stanza to handle the translation. eg.

    show rule MyRule   
    match {
        destination-address 192.168.99.99/32;
    }
    then {
        static-nat {
            prefix {
                192.168.0.99/32;
            }
        }
    }
