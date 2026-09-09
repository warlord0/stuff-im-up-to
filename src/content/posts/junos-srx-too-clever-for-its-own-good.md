---
pubDatetime: 2017-07-28T13:10:00Z
modDatetime: 2017-07-28T13:12:17Z
title: "JunOS SRX too clever for it's own good!"
tags:
  - "dns"
  - "Networking"
  - "Security"
description: "Today the planned migration from a Juniper ScreenOS SSG to a JunOS SRX didn't quite go as smoothly as I'd have liked. We spent many hours last night and th"
---
Today the planned migration from a Juniper ScreenOS SSG to a JunOS SRX didn't quite go as smoothly as I'd have liked. We spent many hours last night and this morning trying to figure out why numerous services that worked fine through the SSG firewall failed through the SRX. This despite me having triple checked the rule sets matched exactly from one system to the other. We ended up making changes to connected systems to resolve the problems as workarounds but this was far from ideal. The eventual culprit turned out to be a default feature that is enabled on the SRX within the default application `junos-dns-udp`. By default the `junos-dns-udp`​ application enables the application layer gateway (ALG) for DNS. This ALG tries to be clever and picks up any DNS request that resolves to a static NAT'ed address and then rewrites the result to give it the NAT'ed version as the response instead. This is far from what we were after! From within our DMZ we make NAT'ed calls to an internal DNS server that answers for the `domain.secure` zone where the internal zone is `domain.local`. This internal DNS server hosts both these zones and basically the request from the DMZ to the DNS server asking for the address `server.domain.secure` fetched the correct result from the DNS server, but on passing through the ALG the SRX got all clever and rewrote it to the `server.domain.local` IP address! All because it matched it to a NAT.

> So when we asked for `domain.secure` we got `domain.local` IP's and vice versa!

No wonder our Active Directory enabled equipment was throwing out it's teddy. To resolve the problem it was simple. Just stop the ALG from "doctoring" the DNS requests. This involves editing `security alg` and setting the `doctoring` option to `none`.

    # edit security alg
    # set dns doctoring none

Using show will return the stanza

    # show
    dns {
        /* Set to none or .secure lookups get converted to .local results */
        doctoring {
            none;
        }
    }

Commit the changes and the DNS queries will no longer be modified based on the NAT'ed address. We could also have disabled the DNS ALG altogether.
