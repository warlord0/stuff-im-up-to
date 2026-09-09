---
pubDatetime: 2017-10-04T11:19:22Z
title: "Fun with NTP"
tags:
  - "debian"
  - "Linux"
description: "One of our Debian servers had a large time discrepancy. Turned out NTP wasn't installed or working. After I installed ntp I still wasn't seeing a time upda"
---
One of our Debian servers had a large time discrepancy. Turned out NTP wasn't installed or working. After I installed ntp I still wasn't seeing a time update. Probably because I was more than 30 minutes adrift. So I had to force an ntp update. Install ntp and set the servers in the .conf to match your ntp servers.

    $ sudo apt-get install ntp
    $ sudo vi /etc/ntp.conf

Then force a time update

    $ sudo systemctl stop ntp.service
    $ sudo ntpd -gq
    $ sudo systemctl start ntp.service

The ntpd may take a while before dropping you back to the prompt.
