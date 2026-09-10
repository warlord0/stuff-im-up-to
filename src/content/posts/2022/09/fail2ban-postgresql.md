---
pubDatetime: 2022-09-14T08:22:39Z
modDatetime: 2023-04-21T17:44:12Z
title: "Fail2ban - PostgreSQL"
tags:
  - "iptables"
  - "Linux"
  - "postgresql"
  - "Security"
heroImage: "/blog-media/2018/02/best-postgresql-hosting.png"
description: "We don't often have the need to expose PostgreSQL to a network, let alone the internet. Mostly the instances are enclosed within a Docker container set and"
---
We don't often have the need to expose PostgreSQL to a network, let alone the internet. Mostly the instances are enclosed within a Docker container set and don't need to be accessed by anything outside of that. So when we have a need to expose it we need to protect it as much as possible.

Make the change to enforce security within PostgreSQL, using TLS and certificates, lock down authentication to IP addresses using `pg_hba.conf`, but we should also monitor and block access at the firewall.

By default, PostgreSQL doesn't include the client IP address in the log output. We need this to be able to use `fail2ban`. Modify the `postgresql.conf` to include two directives:

```
log_connections = on
log_line_prefix = '%m {%h} [%p] %q%u@%d '
```

The client IP will be shown between `{}`'s.

Now add the configuration filter and jail, to `fail2ban` to monitor the regex.

#### /etc/fail2ban/filter.d/posgresql.conf

```
[Definition]
failregex = \{<HOST>\} .+? FATAL:  password authentication failed for user .+$
```

#### /etc/fail2ban/jail.d/postgresql.conf

```
enabled = true
filter = postgresql
logpath = /var/log/postgresql/postgresql*.log
maxretry = 3
bantime = 86400
port = 5432
```

Then restart `fail2ban`.

```
sudo systemctl restart fail2ban
```

### References

[https://serverfault.com/a/1060136](https://serverfault.com/a/1060136)

[Fail2ban – Quick Reference](https://warlord0blog.wordpress.com/2017/07/20/fail2ban-quick-reference/)

## Using PostgreSQL in Docker

This required some different handling, as incoming traffic is forwarded into the docker container and does not use the iptables `INPUT` chain. You must block it using the `FORWARD` chain and a custom `action.d`.

#### /etc/fail2ban/action.d/postgresql.conf

```
[Definition]
actionban = iptables -I FORWARD -s <ip> -j REJECT --reject-with icmp-port-unreachable -m comment --comment "fail2ban postgresql"
actionunban = iptables -D FORWARD -s <ip> -j REJECT --reject-with icmp-port-unreachable -m comment --comment "fail2ban postgresql"

[init]
init = PostgreSQL notifications
```

The `filter.d` is the same, but we need to tweak `jail.d`

#### /etc/fail2ban/jail.d/postgresql.conf

```
[postgresql]
enabled = true
filter = postgresql
logpath = /var/log/postgresql/postgresql*.log
maxretry = 3
bantime = 86400
port = 46432
action = postgresql
```

We also have to modify the docker container, so we mount the folder for `/var/log/postgresql` and modify `postgresql.conf`\` to send logs to a file.

```
logging_collector = on
log_directory = '/var/log/postgresql'
log_truncate_on_rotation = off
log_rotation_age = 1d
```
