---
pubDatetime: 2023-09-29T20:11:00Z
modDatetime: 2023-09-29T18:18:59Z
title: "Securing Docker with iptables"
tags:
  - "Docker"
  - "iptables"
  - "Linux"
heroImage: "/blog-media/2020/01/moby-logo.png"
description: "This is a large, and mostly unknown, issue with using Docker on an internet connected server. If the system is NOT protected by an upstream firewall then a"
---
This is a large, and mostly unknown, issue with using Docker on an internet connected server.

If the system is NOT protected by an upstream firewall then any traffic directed to a docker service that listens on 0.0.0.0/0, means any external service can access the docker service, regardless of what's in your iptables `INPUT` chain. This is because the docker rules are in the `FORWARD` chain, and are then passed into the DOCKER\* rules for handling traffic.

The `DOCKER-USER` chain, by default, allows all sources.

```
$ sudo iptables -L DOCKER-USER -n --line-number

Chain DOCKER-USER (1 references)
num target prot opt source destination
1 RETURN all -- 0.0.0.0/0 0.0.0.0/0
```

If I have a specific IP address or range that I want to allow, I can add a single rule above this that denies traffic from external interfaces if it does NOT come from the source I specify, eg.

```
$ sudo iptables -I DOCKER-USER -i bond0 ! -s 195.x.x.73/32 - j DROP
```

Which gives me:

```
$ sudo iptables -L DOCKER-USER -n --line-number

Chain DOCKER-USER (1 references)
num target prot opt source destination
1 DROP all -- !195.x.x.73/32 anywhere
2 RETURN all -- 0.0.0.0/0 0.0.0.0/0
```

This is fine until I need to add another IP address or range. For instance, if I add a rule after rule 1 that would `DROP` is the source is NOT 195.x.x.101/32, then it would never get beyond rule 1 - because the logic already says, if it's not the IP address 195.x.x.73/32 then `DROP` it.

What I need to do is create a chain of my own. Then use my new chain to process a list of rules, and `RETURN` to the `DOCKER-USER` chain or `DROP` it if it's not in my list.

Create the chain `chain-allow-docker` and add the default/final rule as `DROP`.

```
sudo iptables -N chain-allow-docker
sudo iptables -A chain-allow-docker -j DROP
```

Now all I have to do is “insert” any source addresses to the list that `RETURN`'s to the `DOCKER-USER` rule, eg.

```
sudo iptables -I chain-allow-docker -i bond0 -s 195.x.x.73/32 -j RETURN
sudo iptables -I chain-allow-docker -i bond0 -s 195.x.x.101/32 -j RETURN
```

If you wanted to, these rules could be more specific and contain only what ports you want the source to access, by adding in `-p tcp --dport`, etc. to the rule.

Which looks like:

```
$ sudo iptables -L chain-allow-docker -n --line-numbers

Chain chain-allow-docker (1 references)
num target prot opt source destination
1 RETURN all -- 195.x.x.73/32 0.0.0.0/0
2 RETURN all -- 195.x.x.101/32 0.0.0.0/0
3 DROP all -- 0.0.0.0/0 0.0.0.0/0

$ sudo iptables -L DOCKER-USER -n --line-numbers
Chain DOCKER-USER (1 references)
num target prot opt source destination
1 chain-allow-docker all -- 0.0.0.0/0 0.0.0.0/0
2 RETURN all -- 0.0.0.0/0 0.0.0.0/0
```

- Traffic comes into `FORWARD`
- goes to `DOCKER-USER`
- goes to `chain-allow-docker` 
- if it is one of our `RETURN` lines, it comes back to `DOCKER-USER`
- hits the last line to `RETURN`
- and then `FORWARD` allows it to continue.

If it's not in one of our `chain-allow-docker` `RETURN` lines, it meets the last line in `chain-allow-docker` and `DROP`.

## References

[https://www.fosslinux.com/100845/iptables-and-docker-securely-running-containers-with-iptables.htm](https://www.fosslinux.com/100845/iptables-and-docker-securely-running-containers-with-iptables.htm)[](https://smartlimited.sharepoint.com/sites/SmartIT-Midlands/SitePages/Securing.aspx#references)
