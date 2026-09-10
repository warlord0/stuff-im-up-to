---
pubDatetime: 2018-01-12T23:22:34Z
modDatetime: 2021-03-22T20:28:08Z
title: "Microsoft Azure and Juniper SRX"
tags:
  - "azure"
  - "juniper"
  - "Security"
  - "vpn"
  - "Windows"
heroImage: "/blog-media/2016/09/juniper.png"
description: "We're getting on the Microsoft Office 366 and band wagon. I'm not a Microsoft fan, and think it's overpriced for the functionality we'll actually use. This means we need to setup an IPSec VPN between the Juniper SRX and Azure."
---
We're getting on the Microsoft Office 366 and band wagon. I'm not a Microsoft fan, and think it's overpriced for the functionality we'll actually use. This means we need to setup an IPSec VPN between the Juniper SRX and Azure. Microsoft have a Github page with not just guidance, but specific configuration examples to help do this. Not just with Juniper, but a range of firewalls. [https://github.com/Azure/Azure-vpn-config-samples](https://github.com/Azure/Azure-vpn-config-samples) We've got some consultants in setting up the Azure side of the VPN and once I got into the portal I laughed at how much they were charging for turning on the VPN feature and setting a private key - that's it! There's very little control to be able to do anything else and if you want logs to see why things aren't going to plan, you'd better rely on your own device for that. After a couple of hours they'd written some PowerShell to gather some information that was stale because we'd already moved on past that particular error.

> But that said, the Azure side just works. Get your device side right and do your debugging from there and let Azure sit and just do it's thing. You have to assume that Azure just works.

My biggest failure with the SRX was to use `st1` as the interface. The VPN would not initiate. Eventually I came across this: [https://kb.juniper.net/InfoCenter/index?page=content&id=KB24647](https://kb.juniper.net/InfoCenter/index?page=content&id=KB24647)

> Currently, SRX does not support the **ST1** tunnel interface to terminate VPN connections by design.

So by creating a new interface unit under `st0` as `st0.10` the VPN was at least firing into action and began to negotiate. The following article link was very useful. There are a few typos and some incorrect commands - but they are minor. It at least pointed me into creating a security zone for Azure and not just hanging it off the Internet zone as Microsoft's guidance would have you. [https://juniperguru.wordpress.com/2013/10/16/how-to-connect-a-juniper-srx-firewall-to-windows-azure-virtual-network-gateway-the-easy-way/](https://juniperguru.wordpress.com/2013/10/16/how-to-connect-a-juniper-srx-firewall-to-windows-azure-virtual-network-gateway-the-easy-way/) So our configuration for Azure so far looks like this. The non-bold are pretty much the advised configuration straight from Microsoft. The **bold** is where we had to add our specifics. One big change we made based on the above was to use a security zone for Azure and not just add another interface to the Internet zone.

    # show | display set

    set security ike proposal azure-proposal authentication-method pre-shared-keys
    set security ike proposal azure-proposal dh-group group2
    set security ike proposal azure-proposal authentication-algorithm sha1
    set security ike proposal azure-proposal encryption-algorithm aes-256-cbc
    set security ike proposal azure-proposal lifetime-seconds 28800

    set security ike policy azure-policy mode main
    set security ike policy azure-policy proposals azure-proposal
    set security ike policy azure-policy pre-shared-key ascii-text "$9$xxxxxxxxxxxxxxxxx/"

    set security ike gateway azure-gateway ike-policy azure-policy
    set security ike gateway azure-gateway address 51.X.X.X
    set security ike gateway azure-gateway external-interface reth1.1
    set security ike gateway azure-gateway version v2-only
    set security ike gateway azure-gateway no-nat-traversal

    set security ipsec proposal azure-ipsec-proposal protocol esp
    set security ipsec proposal azure-ipsec-proposal authentication-algorithm hmac-sha1-96
    set security ipsec proposal azure-ipsec-proposal encryption-algorithm aes-256-cbc
    set security ipsec proposal azure-ipsec-proposal lifetime-seconds 27000

    set security ipsec policy azure-vpn-policy proposals azure-ipsec-proposal

    set security ipsec vpn azure-ipsec-vpn bind-interface st0.10
    set security ipsec vpn azure-ipsec-vpn ike gateway azure-gateway
    set security ipsec vpn azure-ipsec-vpn ike ipsec-policy azure-vpn-policy
    set security ipsec vpn azure-ipsec-vpn establish-tunnels immediately

    set security policies from-zone Trust to-zone Azure policy Trust-to-Azure match source-address Trust_Network_Range
    set security policies from-zone Trust to-zone Azure policy Trust-to-Azure match destination-address Azure-Virtual-Network
    set security policies from-zone Trust to-zone Azure policy Trust-to-Azure match application any
    set security policies from-zone Trust to-zone Azure policy Trust-to-Azure then permit
    set security policies from-zone Trust to-zone Azure policy Trust-to-Azure then log session-close

    set security policies from-zone Azure to-zone Trust policy Azure-to-Trust match source-address Azure-Virtual-Network
    set security policies from-zone Azure to-zone Trust policy Azure-to-Trust match destination-address Trust_Network_Range
    set security policies from-zone Azure to-zone Trust policy Azure-to-Trust match application any
    set security policies from-zone Azure to-zone Trust policy Azure-to-Trust then permit
    set security policies from-zone Azure to-zone Trust policy Azure-to-Trust then log session-close

    set security zones security-zone Azure address-book address Azure-Virtual-Network 10.0.0.0/16
    set security zones security-zone Azure interfaces st0.10

    set security flow tcp-mss ipsec-vpn mss 1350

    set security zone security-zone SMZ host-inbound-traffic system-services ike

But we're not there yet! We're still not connecting and this is down to our network design. We don't just have a single firewall between our production LAN and the internet. We have two firewalls by different vendors that create a "Service Mediation Zone" (SMZ) or in other words a DMZ. We can't terminate the VPN at the outer firewall as that would then place the endpoint in the SMZ/DMZ with no connection to the production domain/LAN. So in order to terminate at the production LAN the inner firewall needs to terminate the VPN and the outer needs to NAT the IPSec traffic to and from the internet. The outer firewall was setup to do both source and destination NAT for IPSec and this I think is where our problem was. The outer firewall is capable of recognising IPSec traffic so it looks like it used NAT traversal for IPSec (NAT-T) and because the outer dealt with that, the Juniper SRX borked because by default it supports NAT-T. I need to do more testing, but we got the VPN up by disabling NAT traversal on the SRX.

    set security ike gateway azure-gateway no-nat-traversal

To see what's happening on the IKE negotiations we monitored the IKE status using:

    set security ike traceoptions file srx-vpn.log
    set security ike traceoptions flag all

Then view the log file

    # run show log srx-vpn.log | no--more

We also had some support from a 3rd party Juniper support company who turned on some flow monitoring. This was where we noticed the use of UDP port 4500 - which is for NAT-T and gave us the clue to disable it on the SRX. The good part for me was at least the config was correct before the 3rd party got involved and they remained puzzled for some time. We all suspected it was the two firewall setup, but not how to resolve it until the UDP port 4500 clue. I'd rather try to build something than use a support organisation for free consultancy.

> Build it yourself, then if it doesn't work ask "why not?" Don't just say "come in and build this for me."

## Edited

One major issue we had was resolved by setting the SRX as a "responder" by enabling the `system-services ike`​ on the inbound security zone. For us that's our SMZ, but would be your Internet or Untrust zone.
