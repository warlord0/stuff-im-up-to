---
pubDatetime: 2023-01-09T14:21:16Z
modDatetime: 2023-04-21T11:43:55Z
title: "Fail2ban with Gitea"
tags:
  - "Linux"
  - "Security"
description: "I noticed a bot had decided to target our Gitea service, so thought of putting it into fail2ban to lock it down. Turned out this wasn't as straight forward"
---
I noticed a bot had decided to target our Gitea service, so thought of putting it into fail2ban to lock it down. Turned out this wasn't as straight forward as I'd hoped.

Adding to the fail2ban was not a simple task, as Gitea is in a docker container. First thing required is to change the docker json/console output the log to syslog instead.

#### docker-compose.yml

Add a logging stanza to the gitea service in docker-compose.yml

```
logging:
  driver: syslog
  options:
    syslog-address: udp://127.0.0.1:514
    tag: "gitea"
```

Notice I tagged it with `gitea`. You could make this a bit more automated using something like:

```
tag: "{{.NAME}}/{{.ID}}"
```

This is used by rsyslog as a filter to separate gitea traffic to `gitea.log` as below.

## rsyslog

#### /etc/rsyslog.conf

Edit the `rsyslog.conf` file to enable listening on udp by uncommenting the lines:

```
# provides UDP syslog reception
module(load="imudp")
input(type="imudp" port="514")
```

#### rsyslog.d/30-gitea

Edit/create the file to filter the received log

```
#Log gitea docker log messages to file
:syslogtag,contains,"gitea" /var/log/gitea.log
```

Now we can monitor the `/var/log/gitea.log` file to start banning users.

## fail2ban

#### fail2ban/filter.d/gitea.conf

```
[Definition]
failregex = Invalid user.* <HOST>
```

#### fail2ban/jail.d/gitea.conf

```
[gitea-docker]
enabled = true
filter = gitea
logpath = /var/log/gitea*.log
maxretry = 5
bantime = 365d
port = 22
action = iptables-allports[chain="FORWARD"]
```

The magic that makes this work is `action = iptables-allports[chain="FORWARD"]`. The reason for this is that iptables gets NAT'et traffic from the gateway firewall and cannot block the NAT address unless it is in the `FORWARD` chain..
