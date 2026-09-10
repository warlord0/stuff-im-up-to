---
pubDatetime: 2018-01-31T09:46:04Z
modDatetime: 2018-01-31T09:49:32Z
title: "Azure IPSec VPN Ups and Downs"
tags:
  - "azure"
  - "juniper"
  - "Networking"
  - "Security"
heroImage: "/blog-media/2016/09/juniper.png"
description: "Following our IPSec connection setup for Azure and the Juniper SRX we were seeing regular disconnections and a failure to re-establish a tunnel for extende"
---
Following our IPSec connection setup for Azure and the Juniper SRX we were seeing regular disconnections and a failure to re-establish a tunnel for extended period. This was very frustrating as about every 7 hours and 20 minutes we'd lose connection. We'd then have to restart the IPSec service on the SRX and it would come back up. As our SRX is hosted inside another firewall the IPSec traffic is NAT'ed and we began to wonder if that was the problem. So we did some log watching on the external firewall and grabbed some tcpdump information as the tunnel was down and saw nothing to indicate that packets were being dropped on the external firewall.

    # tcpdump -nei any host [IP Address]

We monitored the internal and external IP's and could see IPSec traffic.

    08:51:31.195272 Out 00:2a:4c:a0:61:a1 ethertype IPv4 (0x0800), length 120: X.X.X.X.500 > Y.Y.Y.Y.500: isakmp: child_sa inf2[R]
    08:51:32.637123 In f0:7a:09:ae:16:41 ethertype IPv4 (0x0800), length 120: Y.Y.Y.Y > X.X.X.X: ESP(spi=0x2a8ced1f,seq=0x616), length 84
    08:51:32.637139 Out f0:7a:09:ae:16:41 ethertype IPv4 (0x0800), length 120: Y.Y.Y.Y > X.X.X.X: ESP(spi=0x2a8ced1f,seq=0x616), length 84
    08:51:33.188226 In f0:7a:09:ae:16:41 ethertype IPv4 (0x0800), length 120: Y.Y.Y.Y.500 > X.X.X.X.500: isakmp: child_sa inf2[I]
    08:51:33.188232 Out f0:7a:09:ae:16:41 ethertype IPv4 (0x0800), length 120: Y.Y.Y.Y.500 > X.X.X.X.500: isakmp: child_sa inf2[I]
    08:51:33.199528 Out 00:2a:4c:a0:61:a1 ethertype IPv4 (0x0800), length 120: X.X.X.X.500 > Y.Y.Y.Y.500: isakmp: child_sa inf2[R]
    08:51:35.190937 In f0:7a:09:ae:16:41 ethertype IPv4 (0x0800), length 120: Y.Y.Y.Y.500 > X.X.X.X.500: isakmp: child_sa inf2[I]
    08:51:35.190955 Out f0:7a:09:ae:16:41 ethertype IPv4 (0x0800), length 120: Y.Y.Y.Y.500 > X.X.X.X.500: isakmp: child_sa inf2[I]
    08:51:35.200221 Out 00:2a:4c:a0:61:a1 ethertype IPv4 (0x0800), length 120: X.X.X.X.500 > Y.Y.Y.Y.500: isakmp: child_sa inf2[R]

On the logging for the SRX we had Juniper and a 3rd Party checking the data and saw negotiations and then some of what they found contained `packet dropped: for self but not interested.`

    [Jan 20 12:57:51]ikev2_list_packet_payloads: Sending packet: HDR, N(REKEY_SA), SA, Nonce, TSi, TSr 
    [Jan 20 12:57:51]IKEv2 packet S(<none>:500 -> Y.Y.Y.Y:500): len= 204, mID=0, HDR, N(REKEY_SA), SA, Nonce, TSi, TSr 
    [Jan 20 12:57:51]ikev2_packet_st_send_request_address: FSM_SET_NEXT:ikev2_packet_st_send 
    [Jan 20 12:57:51]ikev2_udp_send_packet: [119b000/1251000] <-------- Sending packet - length = 0 VR id 0 <> 
    [Jan 20 12:58:01]IKEv2 packet S(<none>:500 -> Y.Y.Y.Y:500): mID=0 (retransmit count=1) 
    [Jan 20 12:58:01]ikev2_packet_st_send: FSM_SET_NEXT:ikev2_packet_st_send_request_address
    [Jan 20 12:58:11]ikev2_packet_st_send_request_address: FSM_SET_NEXT:ikev2_packet_st_send 
    [Jan 20 12:58:11]ikev2_udp_send_packet: [119b000/1251000] <-------- Sending packet - length = 0 VR id 0 <> 
    [Jan 20 12:58:41]IKEv2 packet S(<none>:500 -> Y.Y.Y.Y:500): mID=0 (retransmit count=5) 
    [Jan 20 12:58:41]ikev2_packet_st_send: FSM_SET_NEXT:ikev2_packet_st_send_request_address
    [Jan 20 12:58:51]ikev2_packet_st_send_request_address: FSM_SET_NEXT:ikev2_packet_st_send

    Jan 24 14:15:43 14:15:43.444746:CID-1:RT: packet dropped, packet dropped: for self but not interested. 
    Jan 24 14:15:43 14:15:43.444746:CID-1:RT:flow_initiate_first_path: first pak no session Jan 24 14:15:43 14:15:43.444746:CID-1:RT: flow find session returns error. 
    Jan 24 14:15:43 14:15:43.444746:CID-1:RT:flow_proc_rc: -1. 
    Jan 24 14:15:43 14:15:43.444746:CID-1:RT: ----- flow_process_pkt rc 0x7 (fp rc -1)

So we now knew that the outer firewall wasn't interfering and packets were getting through, but something was clearly not right. Under advisement we removed the SRX config to not immediately act as the initiator by deleting the line:

    delete security ipsec vpn azure-ipsec-vpn establish-tunnels immediately

Which made me think about how the tunnel was getting established. Are we setup as initiator or responder? A Google lead me to this confusing article: [https://forums.juniper.net/t5/SRX-Services-Gateway/Setting-an-ipsec-tunnel-to-responder-only/td-p/272230](https://forums.juniper.net/t5/SRX-Services-Gateway/Setting-an-ipsec-tunnel-to-responder-only/td-p/272230) Confusing because it's been edited and it's not clear with it's use of "don't configure" in the edited section to  "not do", so the double negative melted my head and I figured out what I needed to do.

> To act as a responder I needed to enable the `ike` service on the inbound zone.

This was a light bulb moment as up until this nothing was listening for IKE on the inbound zone. So probably would make sense for the SRX to be "not interested" in the packets. For us the inbound zone is the SMZ, for you it could be the Internet or Untrust zone. So I enabled the service using:

    set security zones security-zone SMZ host-inbound-traffic system-services ike

Immediately after committing this the tunnel came up. I'm not sure if this is to be expected, so best to wait for the 7 hours 20 minutes and see what happens.

## Checking the Results

The most useful command for checking the results appears to be getting the detail of the ipsec security association for the specific index. List the IPSec security associations

    > show security ipsec security-associations 
    node0:
    --------------------------------------------------------------------------
     Total active tunnels: 3
     ID Algorithm SPI Life:sec/kb Mon lsys Port Gateway 
     <131073 ESP:aes-cbc-256/sha1 d3b10cfc 5044/ unlim - root 500 10.Z.Z.Z 
     >131073 ESP:aes-cbc-256/sha1 7368fc9b 5044/ unlim - root 500 10.Z.Z.Z 
     <131074 ESP:aes-cbc-256/sha1 332ad3c7 21727/unlim - root 500 10.A.A.A 
     >131074 ESP:aes-cbc-256/sha1 8e6651f4 21727/unlim - root 500 10.A.A.A 
     <131075 ESP:aes-cbc-256/sha1 2a8ced1f 22833/unlim - root 500 Y.Y.Y.Y 
     >131075 ESP:aes-cbc-256/sha1 7a1c2a8c 22833/unlim - root 500 Y.Y.Y.Y

The above sample shows the index we are interested in is **131075**. So now we get more detail for that specific index using:

    > show security ipsec security-associations detail index 131075 
    node0:
    --------------------------------------------------------------------------

    ID: 131075 Virtual-system: root, VPN Name: azure-ipsec-vpn
     Local Gateway: X.X.X.X, Remote Gateway: Y.Y.Y.Y
     Local Identity: ipv4_subnet(any:0,[0..7]=X.X.X.X/12)
     Remote Identity: ipv4_subnet(any:0,[0..7]=10.0.0.0/20)
     Version: IKEv2
     DF-bit: clear, Copy-Outer-DSCP Disabled, Bind-interface: st0.10
     Port: 500, Nego#: 26, Fail#: 0, Def-Del#: 0 Flag: 0x600a21
     Tunnel events:
     Wed Jan 31 2018 02:11:19: IKE SA rekey successfully completed (2 times)
     Wed Jan 31 2018 01:11:51: IPSec SA rekey successfully completed (2 times)
     Tue Jan 30 2018 10:59:18: IPSec SA negotiation successfully completed (2 times)
     Tue Jan 30 2018 10:59:18: IKE SA negotiation successfully completed (4 times)
     Tue Jan 30 2018 10:04:57: User cleared IKE SA from CLI, corresponding IPSec SAs cleared (1 times)
     Tue Jan 30 2018 09:45:28: IPSec SA negotiation successfully completed (1 times)
     Tue Jan 30 2018 09:45:28: User cleared IKE SA from CLI, corresponding IPSec SAs cleared (1 times)
     Tue Jan 30 2018 05:22:56: No response from peer. Negotiation failed (1 times)
     Tue Jan 30 2018 05:22:11: IPSec SA negotiation successfully completed (3 times)
     Mon Jan 29 2018 22:02:42: No response from peer. Negotiation failed (1 times)
     Mon Jan 29 2018 22:01:44: IKE SA negotiation successfully completed (3 times)
     Mon Jan 29 2018 15:22:43: Tunnel configuration changed. Corresponding IKE/IPSec SAs are deleted (1 times)
     Mon Jan 29 2018 10:03:11: IKE SA rekey successfully completed (9 times)
     Fri Jan 26 2018 13:39:00: IKE SA negotiation successfully completed (7 times)
     Direction: inbound, SPI: 8512d6f5, AUX-SPI: 0
     , VPN Monitoring: -
     Hard lifetime: Expires in 2010 seconds
     Lifesize Remaining: Unlimited
     Soft lifetime: Expires in 1450 seconds
     Mode: Tunnel(0 0), Type: dynamic, State: installed
     Protocol: ESP, Authentication: hmac-sha1-96, Encryption: aes-cbc (256 bits)
     Anti-replay service: disabled
     Direction: outbound, SPI: 32c3a32a, AUX-SPI: 0
     , VPN Monitoring: -
     Hard lifetime: Expires in 2010 seconds
     Lifesize Remaining: Unlimited
     Soft lifetime: Expires in 1450 seconds
     Mode: Tunnel(0 0), Type: dynamic, State: installed
     Protocol: ESP, Authentication: hmac-sha1-96, Encryption: aes-cbc (256 bits)
     Anti-replay service: disabled

Which shows the tunnel renegotiation is happening and has happened 2 times. You can do the same sort of detail with the ike side using:

    > show security ike security-associations index 6226807 detail 
    node0:
    --------------------------------------------------------------------------
    IKE peer Y.Y.Y.Y, Index 6226807, Gateway Name: azure-gateway
     Role: Responder, State: UP
     Initiator cookie: 77034040d34a7428, Responder cookie: 2dfe60279d917d73
     Exchange type: IKEv2, Authentication method: Pre-shared-keys
     Local: X.X.X.X:500, Remote: Y.Y.Y.Y:500
     Lifetime: Expires in 2148 seconds
     Reauth Lifetime: Disabled
     IKE Fragmentation: Disabled, Size: 0
     Remote Access Client Info: Unknown Client
     Peer ike-id: Y.Y.Y.Y
     AAA assigned IP: 0.0.0.0
     Algorithms:
     Authentication : hmac-sha1-96 
     Encryption : aes256-cbc
     Pseudo random function: hmac-sha1
     Diffie-Hellman group : DH-group-2
     Traffic statistics:
     Input bytes : 171220
     Output bytes : 171204
     Input packets: 2251
     Output packets: 2251
     Input fragmentated packets: 0 
     Output fragmentated packets: 0
     IPSec security associations: 2 created, 0 deleted
     Phase 2 negotiations in progress: 1

    Negotiation type: Quick mode, Role: Responder, Message ID: 0
     Local: X.X.X.X:500, Remote: Y.Y.Y.Y:500
     Local identity: Z.Z.Z.Z
     Remote identity: Y.Y.Y.Y
     Flags: IKE SA is created. Waiting for remove

Now we can see that we are the responder.

> Why the ike service wasn't spotted by Juniper or 3rd Party support, who can say? But I'm just happy that we now have a stable VPN connecting us to our Azure systems.

### References

[https://forums.juniper.net/t5/SRX-Services-Gateway/Setting-an-ipsec-tunnel-to-responder-only/td-p/272230](https://forums.juniper.net/t5/SRX-Services-Gateway/Setting-an-ipsec-tunnel-to-responder-only/td-p/272230)
