---
pubDatetime: 2018-05-16T13:25:20Z
modDatetime: 2018-05-16T14:48:22Z
title: "Debian Stretch NTP Time Sync"
tags:
  - "debian"
  - "Linux"
description: "No more messing about with installing ntp. Just a simple edit of what ntp servers to use. Internally my ntp fails and reports regularly in syslog: May 16 1"
---
No more messing about with installing ntp. Just a simple edit of what ntp servers to use. Internally my ntp fails and reports regularly in syslog:

    May 16 14:07:05 testserver systemd-timesyncd[394]: Timed out waiting for reply from 134.0.16.1:123 (3.debian.pool.ntp.org).

Which isn't surprising as we don't allow internal services access to external services. So we need to tell the system what servers to use.

    $ sudo vi /etc/systemd/timesyncd.conf

add in your own space separated list of servers:

    NTP=192.168.1.55 192.168.1.108

Restart the timesyncd service daemon:

    $ sudo systemctl restart systemd-timesyncd

And in syslog you'll see:

    May 16 14:17:01 testserver systemd[1]: Stopping Network Time Synchronization...
    May 16 14:17:01 testserver systemd[1]: Stopped Network Time Synchronization.
    May 16 14:17:01 testserver systemd[1]: Starting Network Time Synchronization...
    May 16 14:17:01 testserver systemd[1]: Started Network Time Synchronization.
    May 16 14:17:02 testserver systemd-timesyncd[10047]: Synchronized to time server 192.168.1.55:123 (192.168.1.55).
    May 16 14:17:02 testserver systemd[9968]: Time has been changed
    May 16 14:17:02 testserver systemd[1]: Time has been changed
