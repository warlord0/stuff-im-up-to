---
pubDatetime: 2020-05-30T11:17:00Z
modDatetime: 2023-04-21T17:48:19Z
title: "Central Logging"
tags:
  - "Linux"
  - "Security"
heroImage: "/blog-media/2017/02/download-10-e1488295217214.jpg"
description: "System logging should not remain a local activity. If you find your system has been compromised often the first thing in the attackers mind is to stop it f"
---
System logging should not remain a local activity. If you find your system has been compromised often the first thing in the attackers mind is to stop it from logging what they have done, what they are doing, or are about to do. If you're going to be security minded you must send your logs to another system and monitor the activity there.

This is very easy to do with rsyslog. I've built this in an Ansible task within the [Lynis Security Auditing](/posts/lynis-security-auditing/). All you need to do is add a simple file in `/etc/rsyslog.d` and restart rsyslog. Sure it won't stop you getting hacked, but you'll at least have a record of what happened up until the point the attacker disables logging.

#### /etc/rsyslogd/01-remotelog.conf

```
######### Enable On-Disk queues for remote logging ##########

# An on-disk queue is created for this action. If the remote host is
# down, messages are spooled to disk and sent when it is up again.

$WorkDirectory /var/spool/rsyslog # where to place spool files
$ActionQueueFileName uniqName     # unique name prefix for spool files
$ActionQueueMaxDiskSpace 100M     # space limit
$ActionQueueSaveOnShutdown on     # save messages to disk on shutdown
$ActionQueueType LinkedList       # run asynchronously
$ActionResumeRetryCount -1        # infinite retries if host is down

*.*   @syslog_server
```

The important part here is the `@syslog_server`. Change this to match the name of the server you want the logs to be sent to, eg. `@log`

On the Central Server - the system that receives the logs it's equally straight forward. Add a file in the folder `/etc/rsyslog.d` and restart rsyslogd.

#### /etc/rsyslog.d/02-centralserver.conf

```
$ModLoad imudp
$UDPServerRun 514

$template RemoteLogs,"/var/log/%HOSTNAME%/%PROGRAMNAME%.log"
*.* ?RemoteLogs
& ~
```

This will send store the logs in a folder with the name of the sending host under `/var/log`.

One step you will need to take on the central server is to open a firewall port to allow the traffic from your sender(s) to the UDP port 514.

```
iptables -A INPUT -p udp --dport 514 -j ACCEPT
```

This will allow any sender, you may want to be more restrictive using a subnet or even a host with something like `-s 192.168.0.0/24`. (see also [iptables – Part 1](/posts/iptables-part-1/)).
