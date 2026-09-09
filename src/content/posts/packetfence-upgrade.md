---
pubDatetime: 2017-01-18T09:26:29Z
modDatetime: 2017-01-18T14:42:51Z
title: "PacketFence Upgrade"
tags:
  - "Linux"
  - "Security"
description: "Running the upgrade for packetfence from version 6.21 to 6.40 caused an issue during the process as freeradius failed to update."
---
Running the upgrade for packetfence from version 6.21 to 6.40 caused an issue during the process as freeradius failed to update.

    dpkg: error processing package packetfence (--configure):
     dependency problems - leaving unconfigured
    Errors were encountered while processing:
     freeradius-ldap
     freeradius-mysql
     freeradius-rest
     freeradius-redis
     packetfence
    E: Sub-process /usr/bin/dpkg returned an error code (1)

This required a few changes to the freeradius install process to get it to work. I could probably have downloaded the .deb and installed freeradius independently, but a few edits of the postinst scripts for the four failures saw it succeed. Edit the four `.postinst` files in `/var/lib/dpkg/info/` names `freeradius-ldap.postinst`, `freeradius-mysql.postinst`, `freeradius-rest.postinst` and `freeradius-redis.postinst` and replace the force-reload with restart. Then just rerun the `apt-get upgrade` process.

    $ sudo vi /var/lib/dpkg/info/freeradius-[name].postinst

`[ESC]:%s/force-reload/restart/g` = Global search and replace `[ESC]:wq` = Save and quit Repeat the above for all four files then:

    $ sudo apt-get dist-upgrade

### PacketFence fails to start after the upgrade

This seems perfectly reasonable given the details in the UPGRADE guide says we need to carry out some schema updates. But when you use apt-get for the install it doesn't seem to do this part for you.

    $ sudo systemctl status packetfence -l
    ● packetfence.service - PacketFence Service
     Loaded: loaded (/lib/systemd/system/packetfence.service; enabled)
     Active: failed (Result: exit-code) since Wed 2017-01-18 08:39:30 GMT; 14min ago
     Process: 1439 ExecStart=/usr/local/pf/bin/pfcmd service pf start (code=exited, status=255)

    Jan 18 08:38:36 packetfence sudo[1475]: pam_unix(sudo:session): session closed for user root
    Jan 18 08:38:43 packetfence pfcmd[1439]: Smartmatch is experimental at /usr/local/pf/lib/pf/cluster.pm line 588.
    Jan 18 08:39:01 packetfence pfcmd[1439]: [Wed Jan 18 08:39:01 2017] pfappserver.pm: Cannot determine desired terminal width, using default of 80 columns
    Jan 18 08:39:19 packetfence pfcmd[1439]: httpd.admin|start
    Jan 18 08:39:19 packetfence pfcmd[1439]: Checking configuration sanity...
    Jan 18 08:39:28 packetfence pfcmd[1439]: FATAL - The PacketFence database schema version '6.2.0' does not match the current installed version '6.4.0'
    Jan 18 08:39:28 packetfence pfcmd[1439]: Please refer to the UPGRADE guide on how to complete an upgrade of PacketFence
    Jan 18 08:39:29 packetfence systemd[1]: packetfence.service: control process exited, code=exited status=255
    Jan 18 08:39:30 packetfence systemd[1]: Failed to start PacketFence Service.
    Jan 18 08:39:30 packetfence systemd[1]: Unit packetfence.service entered failed state.

So it would seem I need to take care of this myself. It's easy enough, just run the sql scripts:

    $ mysql -u root -p pf -v < /usr/local/pf/db/upgrade-6.2.0-6.3.0.sql

    $ mysql -u root -p pf -v < /usr/local/pf/db/upgrade-6.3.0-6.4.0.sql

Then restart `packetfence-config` and `packetfence`. [UPGRADE Guide](https://github.com/inverse-inc/packetfence/blob/stable/UPGRADE.asciidoc)

### radiusd Fails to Start

All looked well until I noticed the service status of radiusd. This refused to start and I couldn't find anywhere that would tell me what was causing the failure. Checking log files returned no clues. A run of `pfcmd checkup` revealed no issues with radius, so I was at a loss. In the end I resorted to running `freeradius` from the command line using debug options and seeing what failed.

    $ sudo /usr/sbin/freeradius -d /usr/local/pf/raddb -Xx -f

This then showed the underlying issue being the path to the certificate files. Looks like the `%%install_dir%%` doesn't work anymore. So I looked for everywhere it was used ad replaced it with the actual install path `/usr/local/pf`. Some of this is generated from template files so make sure you get everything changed. That way when packetfence is restarted and the database writes the config to the files, the templates that it uses also carries the correct path.
