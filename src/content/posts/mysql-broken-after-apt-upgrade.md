---
pubDatetime: 2018-01-18T10:46:21Z
modDatetime: 2018-01-18T13:37:38Z
title: "Mysql Broken After Apt Upgrade"
tags:
  - "Linux"
  - "mysql"
  - "Security"
description: "My local install of mysql-community-server decided to fail today after applying some updates. I'm running Debian buster/sid so these kind of things are to be expected. But this was a totally new one to me."
---
My local install of mysql-community-server decided to fail today after applying some updates. I'm running Debian buster/sid so these kind of things are to be expected. But this was a totally new one to me. Mysql failed to start so the update wouldn't install.

    Unpacking mysql-community-server (5.7.21-1debian9) ...
    Setting up mysql-community-client (5.7.21-1debian9) ...
    Setting up mysql-client (5.7.21-1debian9) ...
    Processing triggers for systemd (236-3) ...
    Processing triggers for man-db (2.7.6.1-4) ...
    Setting up mysql-community-server (5.7.21-1debian9) ...
    Job for mysql.service failed because the control process exited with error code.
    See "systemctl status mysql.service" and "journalctl -xe" for details.
    invoke-rc.d: initscript mysql, action "start" failed.
    ● mysql.service - MySQL Community Server
       Loaded: loaded (/lib/systemd/system/mysql.service; enabled; vendor preset: enabled)
       Active: activating (auto-restart) (Result: exit-code) since Thu 2018-01-18 08:54:36 GMT; 9ms ago
      Process: 11123 ExecStart=/usr/sbin/mysqld --daemonize --pid-file=/var/run/mysqld/mysqld.pid ^[[0;1;31m(code=exited, status=1/FAILURE)^[[0m
      Process: 11088 ExecStartPre=/usr/share/mysql/mysql-systemd-start pre (code=exited, status=0/SUCCESS)
    dpkg: error processing package mysql-community-server (--configure):
     installed mysql-community-server package post-installation script subprocess returned error exit status 1
    Errors were encountered while processing:
     mysql-community-server
    Log ended: 2018-01-18  08:54:36

Then in my syslog file I saw lots of activity constantly trying to start and failing. The problem all stemmed from three important lines in the syslog, two of which appear immediately after trying to start Mysql

    Jan 18 08:55:03 myPC systemd[1]: Starting MySQL Community Server...
    Jan 18 08:55:03 myPC kernel: [ 770.041349] audit: type=1400 audit(1516265703.293:225): apparmor="DENIED" operation="open" profile="/usr/sbin/mysqld" name="/sys/devices/system/node/" pid=12004 comm="mysqld" requested_mask="r" denied_mask="r" fsuid=120 ouid=0
    Jan 18 08:55:03 myPC kernel: [ 770.042022] audit: type=1400 audit(1516265703.293:226): apparmor="DENIED" operation="open" profile="/usr/sbin/mysqld" name="/etc/mysql/my.cnf.fallback" pid=12004 comm="mysqld" requested_mask="r" denied_mask="r" fsuid=120 ouid=0

The third appeared later on.

    Jan 18 08:55:03 myPC kernel: [ 770.270695] audit: type=1400 audit(1516265703.525:227): apparmor="DENIED" operation="mknod" profile="/usr/sbin/mysqld" name="/run/mysqld/mysqld.sock.lock" pid=12006 comm="mysqld" requested_mask="c" denied_mask="c" fsuid=120 ouid=120

So `apparmor` is preventing mysql from accessing files. I haven't a clue what changed. But looking in the file `/etc/apparmor.d/usr.sbin.mysqld` I can't see references to the paths/files mysql is trying to access according to the above log entries. So I edited the file and added in some matching entries.

    $ sudo vi /etc/apparmor.d/usr.sbin.mysqld

    ...
      /etc/mysql/mysql.conf.d/ r,
      /etc/mysql/mysql.conf.d/* r,
      /sys/devices/system/node/* r,
      /etc/mysql/*.cnf r,
      /run/mysqld/* rw,
    ...

Then reloaded the `apparmor` service (don't restart it, reload it!) restarted the mysql service and up it comes.

    $ sudo systemctl reload apparmor.service
    $ sudo systemctl start mysql.service

I was then able to continue with the apt upgrade and see it complete successfully. Other relevant errors noticed in the syslog file:

    Jan 18 08:55:03 myPC mysqld[12004]: 2018-01-18T08:55:03.525899Z 0 [ERROR] Could not create unix socket lock file /var/run/mysqld/mysqld.sock.lock.
    Jan 18 08:55:03 myPC mysqld[12004]: 2018-01-18T08:55:03.525910Z 0 [ERROR] Unable to setup unix socket lock file.
    Jan 18 08:55:03 myPC mysqld[12004]: 2018-01-18T08:55:03.525918Z 0 [ERROR] Aborting
    Jan 18 08:55:03 myPC mysqld[12004]: Initialization of mysqld failed: 0

### References

Not related to Mysql, but a useful insight to apparmor and  it's features. [https://www.digitalocean.com/community/tutorials/how-to-create-an-apparmor-profile-for-nginx-on-ubuntu-14-04](https://www.digitalocean.com/community/tutorials/how-to-create-an-apparmor-profile-for-nginx-on-ubuntu-14-04)
