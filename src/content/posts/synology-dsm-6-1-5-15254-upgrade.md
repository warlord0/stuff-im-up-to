---
pubDatetime: 2018-02-07T21:02:04Z
modDatetime: 2018-04-05T19:08:11Z
title: "Synology DSM 6.1.5-15254 Upgrade"
tags:
  - "Linux"
  - "synology"
description: "Following this upgrade I accepted to install I spent the evening cursing. The system started up and services were accessible as usual, but I couldn't login"
---
Following this upgrade I accepted to install I spent the evening cursing. The system started up and services were accessible as usual, but I couldn't login to the admin Web UI. It just came up with a red box message:

    "System is getting ready. Please log in later."

This went on for several hours. I could access an SSH terminal and check the logs and gather data, but I couldn't figure out why it wouldn't let me in. Everytime I tried it generated a syslog entry:

    DiskStation login.cgi: login.cpp:211 System is not ready

I checked running services, restarting them and nothing. Disable Google authentication, still no joy.

    2018-02-06T20:09:38+00:00 DiskStation synopkgctl: SYSTEM: Last message 'resource_api.cpp:163' repeated 1 times, suppressed by syslog-ng on DiskStation
    2018-02-06T20:09:38+00:00 DiskStation synopkgctl: resource_api.cpp:163 Acquire web-config for DownloadStation when 0x0000 (done)
    2018-02-06T20:09:40+00:00 DiskStation kernel: [ 100.904432] init: pkg-WebStation-userdir main process (11584) terminated with status 1
    2018-02-06T20:09:42+00:00 DiskStation synoiscsiep: iscsi_stop_all.cpp:89 Successfully stopped iSCSI service.
    2018-02-06T20:09:44+00:00 DiskStation synoiscsiep: iscsi_start_all.cpp:101 Successfully started iSCSI service.
    2018-02-06T20:12:51+00:00 DiskStation login.cgi: login.cpp:211 System is not ready
    2018-02-06T20:24:05+00:00 DiskStation synomkflvd: synoidx_system.cpp:36 [NOTICE] system is not ready? start anyway.
    2018-02-06T20:24:05+00:00 DiskStation synomkthumbd: synoidx_system.cpp:36 [NOTICE] system is not ready? start anyway.
    2018-02-06T20:24:10+00:00 DiskStation synoindexd: synoidx_system.cpp:36 [NOTICE] system is not ready? start anyway.
    2018-02-06T21:03:24+00:00 DiskStation login.cgi: login.cpp:211 System is not ready

So I gave up on it and thought I'd revisit it today. Then I received this email at about 3pm today.

> Dear user, DiskStation has finished checking the consistency on system volume (Root). The system is now ready for use. Sincerely, Synology DiskStation

and now I can logon like nothing happened.

## Update

Today it's been 6 days since I upgraded to DSM 6.1.6-15266 and I've not been able to logon because of the same symptoms. More googling ensued until I came across this comment by [delapaco](https://disqus.com/by/delapaco/) on a similar post here: [https://www.supportmyidea.com/cant-login-synology-dsm-system-getting-ready-please-log-later/](https://www.supportmyidea.com/cant-login-synology-dsm-system-getting-ready-please-log-later/) So I ran the first two steps and was finally able to successfully login!

    $ sudo synobootseq --set-boot-done
    $ sudo synobootseq --is-ready
    Boot done

But following a reboot it needed this process repeating so I could logon. Very strange. So I'm probably going to have to report this to Synology and see if there's a fox for it.
