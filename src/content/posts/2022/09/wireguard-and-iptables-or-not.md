---
pubDatetime: 2022-09-06T21:20:47Z
title: "WireGuard and iptables, or Not"
tags:
  - "iptables"
  - "Networking"
  - "vpn"
  - "wireguard"
heroImage: "/blog-media/2020/04/wireguard.png"
description: "iptables isn't essential for WireGuard. It really depends on your requirements. In my previous post , I used iptables for a point-to-multi-point set up. Th"
---
iptables isn't essential for WireGuard. It really depends on your requirements. In my [previous post](/posts/wireguard/), I used iptables for a point-to-multi-point set up. This is because the external user connecting to the office would need to get to all kinds of internal services. Without adding a route to all the internal services to reply to the incoming traffic, there is no way routing alone would handle this. It would become impossible to add routes for each users' endpoint, without them clashing with each other. For this, I had to use NAT.

The `PostUp` rules handled that for me:

```
PostUp = iptables -t mangle -A PREROUTING -i %i -m comment --comment "wireguard"
PostUp = iptables -t nat -A POSTROUTING ! -o %i -j MASQUERADE -m comment --comment "wireguard"
```

- `%i` represents the WireGuard interface name

The other rules in the `FORWARD` chain may not have been necessary, it depends on the existing rules. If you disable forwarding for all but necessary forwards, then you'd need to allow forwarding into and out of the `wg0` interface.

With a point-to-point setup, say user to user. Then things get much easier. No need for iptables and both parties can talk across to each other using routing and `ip_forward` only. Of course, you may choose to add some rules to make things more secure, but a simple enough setup on both ends could be:

```
[interface]
Address = 10.0.0.1/32
ListenPort = 51820
PrivateKey = SuperSecretKey
PreUp = sysctl -w net.ipv4.ip_forward=1

[peer]
PublicKey = SecretKey
AllowedIPs = 10.0.0.2
EndPoint = 192.168.100.12:51820
```

Now, peers can talk to each other over the IP addresses 10.0.0.1 and 10.0.0.2. The 192.168.100.12:51820 represents the network, or internet, addresses used to connect to each other.

No need for the `PreUp` script if you already have forwarding enabled, but it's a useful thing to do to ensure it is set up.

This simple config can work just as well for a multi-point-to-multi-point scenario. Where two offices might be connected. As long as they have different network addresses, no NAT is required. The only thing that changes is the `AllowedIPs`.

```
[interface]
Address = 10.0.0.1/32
ListenPort = 51820
PrivateKey = SuperSecretKey
PreUp = sysctl -w net.ipv4.ip_forward=1

[peer]
PublicKey = SecretKey
AllowedIPs = 10.0.1.0/24
EndPoint = 192.168.100.12:51820
```

The other end could use an `AllowedIPs = 10.0.2.0/24` and the two networks can then talk to each other - with one important caveat. You either have the peers set as default routes, or add to the routes on the peer network for the other end, eg.

```
sudo ip route add 10.0.2.0/23 via 10.0.1.1 dev eno1
```

and vice versa.

- 10.0.1.1 represents the IP address of the peer

## Passing Over the Config

When sending the other party the WireGuard config, you can use a QR code. Very handy for mobile devices. Once you've saved the peers `wg0.conf` as a text file, convert it to an image using

```
qrencode -t png -r wg0.conf -o wg0.png
```

Then you can scan it with the mobile WireGuard client on Android, or fruit based device.
