---
pubDatetime: 2020-04-07T16:20:15Z
modDatetime: 2023-10-24T20:16:53Z
title: "iptables - Part 1"
tags:
  - "firewall"
  - "iptables"
  - "Linux"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "My understanding of iptables is rudimentary, and I thought it's time to improve on it. I have an understanding of firewalls, NAT and packet filtering, but"
---
My understanding of iptables is rudimentary, and I thought it's time to improve on it. I have an understanding of firewalls, NAT and packet filtering, but putting this into iptables always seems hard work.

There are lots of online resources, but nothing seems to be comprehensive enough to cover everything I wanted, and writing these posts also acts as a means of driving the material into my own brain. So I thought I'd document it myself in the way that I would typically use it.

A good place to start is list the rules you currently have.

```
# iptables --list
Chain INPUT (policy ACCEPT)
target     prot opt source               destination         

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination 
```

This shows that everything is permitted. Nothing has been configured on the firewall.

Incoming packets go through the INPUT chain and the default policy action is to ACCEPT them. Similarly, for outgoing, packets go through OUTPUT, and packets not destined for us go through FORWARD, and all are ACCEPTED.

Because there are probably a lot of other tables and chains, to reset everything to a factory fresh, clean slate, you have to issue several commands:

```
# iptables -F
# iptables -X
# iptables -t nat -F
# iptables -t nat -X
# iptables -t mangle -F
# iptables -t mangle -X
# iptables -P INPUT ACCEPT
# iptables -P FORWARD ACCEPT
# iptables -P OUTPUT ACCEPT
```

This flushes `-F` the rules from the chains and then deletes the chains `-X`, then sets the default chains to ACCEPT all traffic.

## Incoming Rules

First steps are usually to allow remote access using ssh. We can APPEND a rule to our INPUT chain that ACCEPTs ANY TCP protocol traffic destined for our port 22 using:

```
# iptables -A INPUT -j ACCEPT -p tcp --dport 22
```

It's probably best to get this in the table as early as you can, because if you then fudge the rest of the rules you can still at least use `ssh` to get access to the system.

```
# iptables --list                                                       
Chain INPUT (policy ACCEPT)
target     prot opt source               destination         
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:ssh

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination
```

Right now we have our `ssh` rule added, but we aren't stopping anything else anyway. This is because the whole INPUT chain is set to ACCEPT packets. We can now change this behaviour to DROP packets using:

```
# iptables -P INPUT DROP
```

Pay note to the order we did this in. Create the ssh rule to accept packets and then set the input policy to drop everything. If we did this the other way around we'd have prevented ourselves from accessing the system by ssh as soon as we set the input policy to drop.

Let's add another rule for a make believe web server. Our web server listens on both http and https using port 80 and 443. We want to accept any traffic to either of these ports. We could setup two rules, but there is a handy `multiport` option we can use to open both.

```
# iptables -A INPUT -j ACCEPT -p tcp --match multiport --dports 80,443
```

```
# iptables --list                                                       
Chain INPUT (policy DROP)
target     prot opt source               destination         
ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:ssh
ACCEPT     tcp  --  anywhere             anywhere             multiport dports http,https

Chain FORWARD (policy ACCEPT)
target     prot opt source               destination         

Chain OUTPUT (policy ACCEPT)
target     prot opt source               destination 
```

One rule, two ports. If you have an application that uses a range of ports, we can use a colon `:` and specify the range as `FROM:TO`, eg. for ports from 8080 to 8089:

```
# iptables -A INPUT -j ACCEPT -p tcp --match multiport --dports 8080:8089
```

## Saving Your Changes

To make your changes persistent between boots, you need to write the rules into a file for both IPv4 and IPv6.

```
# iptables-save > /etc/iptables/rules.v4
# ip6tables-save > /etc/iptables/rules.v6
```

Or by using sudo:

```
$ sudo bash -c "iptables-save > /etc/iptables/rules.v4"
$ sudo bash -c "ip6tables-save > /etc/iptables/rules.v6"
```

Or

```
$ sudo iptables-save | sudo tee /etc/iptables/rules.v4
$ sudo ip6tables-save | sudo tee /etc/iptables/rules.v6
```

More details: [https://wiki.debian.org/iptables](https://wiki.debian.org/iptables)

## Outgoing Rules

There's no difference in the process for handling OUTPUT rules. But if you're working on a server or workstation, it's not usually necessary to do anything with outgoing rules unless you're in a paranoid environment that requires this level of security.

## Inserting, Appending and Deleting Rules

You'll have seen we used append above using the -A switch. They are self-explanatory, `-I` = insert, `-A` = append and `-D` = delete.

On its own `-I` will insert a rule at the beginning of the specified chain, `-A` will add to the end.

### Line Numbers

To delete a rule you have to be as specific as you were when you created it using the exact creation syntax to remove it. For this reason, I find it easier to display line numbers to deal with editing lines more easily.

```
# iptables --list --line-numbers                                        
Chain INPUT (policy DROP)
num  target     prot opt source               destination         
1    ACCEPT     tcp  --  anywhere             anywhere             tcp dpt:ssh
2    ACCEPT     tcp  --  anywhere             anywhere             multiport dports http,https
```

Now I can delete a specific line without typing everything in and I can be sure I nail the right one. Eg. If I wanted to delete the web server rule we added:

```
# iptables -D INPUT 2
```

Insert a rule before rule 2 using:

```
# iptables -I INPUT 2 -j ACCEPT -p tcp --dport 53
```

## Log and Drop

Whilst the default policy is drop, this isn't helpful for auditing or debugging. We sometimes want to log and then drop the packet.

```
# iptables -A INPUT -j LOG --log-prefix "INPUT:DROP:" --log-level 6
# iptables -A INPUT -j DROP
```

As soon as I added this, I could see output in syslog using:

```
# tail -f /var/log/syslog
```

```
Apr  7 16:19:37 node2 kernel: [ 2695.658497] INPUT:DROP:IN=enp1s0 OUT= MAC=ff:ff:ff:ff:ff:ff:52:54:00:bf:16:56:08:00 SRC=192.168.122.1 DST=192.168.122.255 LEN=160 TOS=0x00 PREC=0x00 TTL=64 ID=3646 DF PROTO=UDP SPT=17500 DPT=17500 LEN=140 
Apr  7 16:20:07 node2 kernel: [ 2725.665884] INPUT:DROP:IN=enp1s0 OUT= MAC=ff:ff:ff:ff:ff:ff:52:54:00:bf:16:56:08:00 SRC=192.168.122.1 DST=192.168.122.255 LEN=160 TOS=0x00 PREC=0x00 TTL=64 ID=6728 DF PROTO=UDP SPT=17500 DPT=17500 LEN=140 
```

## Something to Think About

Write your basic rule set and save them to the files as stated above. But consider saving them to a file you can work on with a text editor and reorder things and add rules in a more manageable way, eg.

```
# iptables-save > ~/my.rules
# vi ~/.my.rules
# iptables-restore < ~/my.rules
```

But when you are done, don't forget to save the final changes to the system persistent files as above. As you can see below, the file is pretty self-explanatory - based on what we learned above.

### ~/my.rules

```
# Generated by xtables-save v1.8.2 on Tue Apr  7 16:32:34 2020
*nat
:PREROUTING ACCEPT [0:0]
:INPUT ACCEPT [0:0]
:POSTROUTING ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
COMMIT
# Completed on Tue Apr  7 16:32:34 2020
# Generated by xtables-save v1.8.2 on Tue Apr  7 16:32:34 2020
*filter
:INPUT DROP [0:0]
:FORWARD ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
-A INPUT -p tcp -m tcp --dport 22 -j ACCEPT
-A INPUT -p tcp -m tcp --dport 53 -j ACCEPT
-A INPUT -p tcp -m udp --dport 53 -j ACCEPT
-A INPUT -p tcp -m multiport --dports 80,443 -j ACCEPT
-A INPUT -j LOG --log-prefix "INPUT:DROP:" --log-level 6
-A INPUT -j DROP
COMMIT
# Completed on Tue Apr  7 16:32:34 2020
# Generated by xtables-save v1.8.2 on Tue Apr  7 16:32:34 2020
*mangle
:PREROUTING ACCEPT [0:0]
:INPUT ACCEPT [0:0]
:FORWARD ACCEPT [0:0]
:OUTPUT ACCEPT [0:0]
:POSTROUTING ACCEPT [0:0]
COMMIT
# Completed on Tue Apr  7 16:32:34 2020
```

### Conntrack and ctstate

One rule you'll see a lot gets dropped into most input chains as early as you can is something like this:

```
-I INPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
```

What this does is prevent repetitive trawls down your tables to find out if the connection is to be accepted or not. By keeping track of the connections, the firewall is able to identify related and established connections and just accept them. One rule at the top means less processing for packets for connections the firewall already knows about.

In our little firewall set of tables, this may not seem a lot, but when you start noticing how many rules get added to these tables by applications like Docker and libvirt, you begin to understand why picking out known connections early on must be a saving.

However, if you are using OUTPUT rules, the use of `conntrack` can be vital. Take, for example, blocking all outgoing traffic for all ports. Your incoming ssh connection would stop working - why? Because you stopped the outgoing replies to the incoming related ssh packets. By adding in the `contrack` rule, we can accept sending outbound packets to connections that are related and established on our input chain.

```
-I OUTPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
```

## Docker and iptables

Docker makes extensive use of iptables to handle forwarding into its containers. Trouble is, that when you use `iptables-save` to write the current rules to a persistent file, it will include all the dynamic stuff docker has put into the forwarding table. This will include dynamic/temporary interface names like `br-965c11637bde` which probably won't be there next time you restart docker or the container.

> The only way to prevent `iptables-save` from saving these dynamic entries is to stop all of your containers before calling it.

If not, you'll probably have to edit the `rules.v4` file to remove the dynamic entries, which is a messy task. That said, it's not likely to cause a problem, it's just you will end up with meaningless rules in your config that should never get used. The problem only occurs if docker comes up with the same random interface name at a later date.

## References

[https://help.ubuntu.com/community/IptablesHowTo](https://help.ubuntu.com/community/IptablesHowTo)

[https://wiki.debian.org/iptables](https://wiki.debian.org/iptables)

***Coming in Part 2 - iptables and NAT***
