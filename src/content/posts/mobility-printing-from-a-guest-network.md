---
pubDatetime: 2018-01-04T14:28:38Z
modDatetime: 2018-01-09T11:37:25Z
title: "Mobility Printing from a Guest Network"
tags:
  - "dns"
  - "Linux"
  - "Web"
description: "oday I have been mostly fumbling around in DNS trying to get untrusted devices on our Guest network to print to our PaperCut Pull Printing system using NAT."
---
Today I have been mostly fumbling around in DNS trying to get untrusted devices on our Guest network to print to our PaperCut Pull Printing system using NAT. All our WiFi users connect to the Guest VLAN which is isolated from the main production network. There are very few services that need to come from the Guest network into the Trusted zone, but this pull printing is one of them. ![untitled_page](/blog-media/2018/01/untitled_page.png) I followed the guidance from PaperCut for setting up Mobility Print and got it working inside the trusted network first. Mobility Print sets up its own DNS server to answer the discovery requests for the published printers. We only publish one printer/queue as once a print job is put into the queue it can be pulled from any printer on the LAN. Setting up the ports and NAT on the firewall was relatively straight forward. [https://www.papercut.com/products/ng/mobility-print/manual/how-it-works/#protocols-and-ports](https://www.papercut.com/products/ng/mobility-print/manual/how-it-works/#protocols-and-ports) But then I ran into problems with dealing with DNS requests. Inside the Guest VLAN it uses DHCP which gives the clients the DNS server address to use that is our external proxy. So there was no way I could get that to provide responses to the DNS queries for `pc-printer-discovery` or forward requests to the Mobility Print server. My solution to this was to use a Debian Linux server within the Guest VLAN that provides DHCP and DNS. However, the DNS that it would be providing is only for it's own domain `guest.local` and uses forwarders  for all other domains. Then by following the PaperCut setup notes for a BIND server I added in the required records.

    $TTL    604800
    @       IN      SOA     guest.local. root.guest.local. (
                                2         ; Serial
                            604800         ; Refresh
                            86400         ; Retry
                            2419200         ; Expire
                            604800 )       ; Negative Cache TTL
    ;---------------- Mobility Print records --------------
            
    b._dns-sd._udp       IN PTR pc-printer-discovery
    lb._dns-sd._udp      IN PTR pc-printer-discovery
    pc-printer-discovery IN NS  print-server-host
    print-server-host    IN A   XXX.XXX.XXX.XXX
            
    ;--------------- End of Mobility Print records ---------
            
    @       IN      NS      localhost.      ; delete this line
    @       IN      A       127.0.0.1       ; delete this line
    @       IN      AAAA    ::1             ; delete this line

Where `XXX.XXX.XXX.XXX` is the NAT address I configured to forward from my firewall. So this got my DNS server working, but not handling the client queries. To see the client queries I used:

    $ sudo rndc querylog on
    $ sudo tail -f /var/log/named/bind.log

I'm not sure if I missed something in the notes, but I can't see how this would work without forwarding the DNS requests to the NAT'ed `print-server-host`. So to solve that I added a forward only zone in my named.conf.local file:

    zone "pc-printer-discovery" {
        type forward;
        forward only;
        forwarders {
            XXX.XXX.XXX.XXX;
            };
        };
    zone "pc-printer-discovery.guest.local" {
        type forward;
        forward only;
        forwarders {
            XXX.XXX.XXX.XXX;
            };
        };

I covered my bases by adding a top level zone and a sub-zone because it seemed my Android clients worked with the top level zone, but the iOS clients seemed to need the sub-zone. This didn't work straight out of the gate as in my log I was seeing errors like:

    lame-servers: info: error (no valid RRSIG) resolving '_tcp.pc-printer-discovery/DS/IN': XXX.XXX.XXX.XXX#53
    lame-servers: info: error (network unreachable) resolving '_tcp.pc-printer-discovery/DS/IN': 2001:XXX::::XXX#53

Which struck me that it's trying IPv6. So I edited `/etc/default/bind9` and added `-4` to use only IPv4 and retried.

    # run resolvconf?
    RESOLVCONF=no

    # startup options for the server
    OPTIONS="-u bind -4"

Well with IPv4 I got closer. But now it looks like I'm failing DNSSEC.

    lame-servers: info: error (no valid RRSIG) resolving '_tcp.pc-printer-discovery/DS/IN': XXX.XXX.XXX.XXX#53
    lame-servers: info: error (no valid DS) resolving '_ipps._tcp.pc-printer-discovery/PTR/IN': XXX.XXX.XXX.XXX#53

Which resulted in me disabling DNSSEC for the two forward zones in the `/etc/bind/named.conf.options` file:

    dnssec-enable yes;
    dnssec-validation yes;

    dnssec-must-be-secure pc-printer-discovery.guest.local no;
    dnssec-must-be-secure pc-printer-discovery no;

> The change to `dnssec-enable` to `yes` from `auto` was important. It seems the `dnssec-must-be-secure` gets ignored if set to auto.

After a restart of BIND things started to flow. Android and iOS were able to find the print queue and successfully print to any of our printers. As authentication is necessary to print and pull printing requires ID badges it should be robust enough to be as effective as our internal printing systems.

### References

[https://www.papercut.com/products/ng/mobility-print/manual/](https://www.papercut.com/products/ng/mobility-print/manual/) [https://www.papercut.com/products/ng/mobility-print/manual/how-to-setup/step-2-configuration/discover-your-printers-using-dns/](https://www.papercut.com/products/ng/mobility-print/manual/how-to-setup/step-2-configuration/discover-your-printers-using-dns/)
