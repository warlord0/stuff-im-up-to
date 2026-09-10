---
pubDatetime: 2022-09-05T08:11:37Z
modDatetime: 2022-09-05T20:52:39Z
title: "WireGuard"
tags:
  - "Uncategorized"
heroImage: "/blog-media/2020/04/wireguard.png"
description: "WireGuard is a very simple and efficient firewall. It has only one authentication mechanism and that is using public key cryptography, either public/privat"
---
WireGuard is a very simple and efficient firewall. It has only one authentication mechanism and that is using public key cryptography, either public/private keys, or pre-shared key.

It's very much an up-and-coming development that has been added into the Linux kernel, but still has some features to be added to network manager for peer support.

You need to use port forwarding on both ends of the tunnel. This is the part most user or client ends are likely to struggle with. With OpenVPN, we only need to have a system administrator open a firewall rule on the server end of the tunnel. The client doesn't need to do anything other than connect.

## How do I set up my firewall/router to allow me to use WireGuard?

With WireGuard, there is no real client, server relationship. At both ends of the tunnel, they are both peers. This means to establish a tunnel both sides must be able to talk to each other, and they must be able to exchange a secure key.

At the user end of the tunnel, if we have a router that supports UPnP, we can use `miniupnpc`. This will open the required port to allow us to tunnel.

## Point-to-Multi-Point or User to Network

Install WireGuard with `miniupnpc` with `apt` or `pamac`:

```
sudo apt install wireguard miniupnpc
```

```
pamac install wireguard-tools miniupnpc
```

Open the port on your router using `miniupnpc`:

```
$ upnpc -a 192.168.0.10 51820 51820 UDP
upnpc : miniupnpc library test client, version 2.2.3.
 (c) 2005-2021 Thomas Bernard.
Go to http://miniupnp.free.fr/ or https://miniupnp.tuxfamily.org/
for more information.
List of UPNP devices found on the network :
 desc: http://192.168.0.1:49152/IGDdevicedesc_brlan0.xml
 st: urn:schemas-upnp-org:device:InternetGatewayDevice:1

Found valid IGD : http://192.168.0.1:49152/upnp/control/WANIPConnection0
Local LAN ip address : 192.168.0.10
ExternalIPAddress = X.X.X.X
InternalIP:Port = 192.168.0.10:51820
external X.X.X.X:51820 UDP is redirected to internal 192.168.0.10:51820 (duration=604800)
```

Where `192.168.0.10` is the IP address of the workstation you are on.

## The User Config

There are two ways this can be handled. Ideally, the user should generate their own private key and give this to the system admin to add into their config, or the system admin can just generate the user's private key and build the config for them.

The basic principle is that both parties have private keys they keep to themselves, but also have public keys they share with others they want to connect with.

Generate your private key with:

```
$ wg genkey
mJxNP+qtI4g2+IvjKJ41UBsrJcpieINNYx3WagFua3w=
```

This will give a random string to use as your private key. Take this private key and generate a public key to give to the other party.

```
$ echo mJxNP+qtI4g2+IvjKJ41UBsrJcpieINNYx3WagFua3w= | wg pubkey
Q/OXpv+y4yFVFogYjStalhr49kBs5abDaULqzKx1PSY=
```

Create the file `/etc/wireguard/wg0.office.conf`, or just `wg0.conf` if you don't plan on using many tunnels.

```
[Interface]
Address = 192.168.254.100/32
PrivateKey = SuperSecretKey
DNS = 10.0.0.254

[Peer]
PublicKey = SecretKey
Endpoint = X.X.X.X:51820
AllowedIPs = 10.0.0.0/24
```

The interface address is a mutually agreed IP network you are going to use for the tunnel, the private key is from above.

The peer public key, endpoint and allowed ips should all come from the system admin. They are their public key, the external address of the tunnel you will connect to and a comma separated list of the networks that are at the other end of the tunnel you want to get to. This can be 0.0.0.0/0 if all traffic is going to go over the tunnel.

## The Network End

At the network end of the tunnel, eg. the office the config is exactly the same format as the user end, as they are both peers. The file `/etc/wireguard/wg0.conf` stores all our config - there is likely to be only one file. The only changes we probably need to make are to handle NAT, so the user can actually get to systems within the office network. For this, there are `PostUp` and `PostDown` scripts that can be called. We can use them to tell iptables how to NAT traffic for our peers.

```
[Interface]
Address = 192.168.254.01/24
SaveConfig = true
PostUp = iptables -A FORWARD -i %i -j ACCEPT -m comment --comment "wireguard"
PostUp = iptables -A FORWARD -o %i -j ACCEPT -m comment --comment "wireguard"
PostUp = iptables -t mangle -A PREROUTING -i %i -m comment --comment "wireguard"
PostUp = iptables -t nat -A POSTROUTING ! -o %i -j MASQUERADE -m comment --comment "wireguard"
PostDown = iptables -D FORWARD -i %i -j ACCEPT -m comment --comment "wireguard"
PostDown = iptables -D FORWARD -o %i -j ACCEPT -m comment --comment "wireguard"
PostDown = iptables -t mangle -D PREROUTING -i %i -m comment --comment "wireguard"
PostDown = iptables -t nat -D POSTROUTING ! -o %i -j MASQUERADE -m comment --comment "wireguard"
ListenPort = 51820
PrivateKey = SuperSecretKey

[Peer]
PublicKey = SecretKey
AllowedIPs = 192.168.254.100/32

[Peer]
PublicKey = SecretKey
AllowedIPs = 192.168.254.101/32
```

You will notice here that we have more than one peer. This is where we put all the remote users public keys and specify what IP addresses to give them. This file will get updated with successful details, as WireGuard is used, because we have specified `SaveConfig = true`.

> With `SaveConfig = true` you need to be careful when editing the config when the tunnel is up. Making a change and then taking the tunnel down may overwrite your changes. So if you aren't seeing your changes, check that you aren't inadvertently overwriting them at down time.

With iptables locked down to block incoming connections, you will also need to add or insert a rule to open the port for WireGuard.

```
$ sudo iptables -A INPUT -p udp -m udp --dport 51820 -j ACCEPT -m comment --comment "wireguard"
```

## References

[https://www.procustodibus.com/blog/2021/04/wireguard-access-control-with-iptables/](https://www.procustodibus.com/blog/2021/04/wireguard-access-control-with-iptables/)

[https://blogs.gnome.org/thaller/2019/03/15/wireguard-in-networkmanager/](https://blogs.gnome.org/thaller/2019/03/15/wireguard-in-networkmanager/)
