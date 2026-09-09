---
pubDatetime: 2017-07-24T12:18:27Z
modDatetime: 2017-07-24T12:23:15Z
title: "Owncloud 10.0 Upgrade"
tags:
  - "debian"
  - "Linux"
  - "owncloud"
  - "php"
  - "Web"
description: "This should have been easier, but I guess I missed a few things I shouldn't have. I took the opportunity to upgrade Owncloud to v10.0 and also upgraded fro"
---
This should have been easier, but I guess I missed a few things I shouldn't have. I took the opportunity to upgrade Owncloud to v10.0 and also upgraded from Debian Jessie to Stretch. As there is no repository for Owncloud stretch I had to manually upgrade. Which is actually quite straight forward. First I removed the repositories that are no longer needed from `/etc/apt/sources.d/` namely `owncloud`, `php7` and `nginx`, as the latter two are now included in Debian stretch. I edited the `mysql` list entry and changed the version from jessie to stretch. Put simply the Owncloud upgrade is download the tar.bz2, rename your current owncloud folder, extract the bz2, copy your old config.php from the old owncloud and run the upgrade process from the owncloud folder as the web user.

    $ sudo -u www-data ./occ upgrade

This all went well and things were looking good, until I upgraded the OS to stretch. Owncloud still worked but users couldn't login. So I ran a status check

    $ sudo -u www-data ./occ status

This complained of a number of issues but mainly a missing database driver.

    An unhandled exception has been thrown:
    Doctrine\DBAL\DBALException: Failed to connect to the database: An exception occured in driver: could not find driver in var/www/owncloud/lib/private/DB/Connection.php:63

So my upgrade had installed php7.0, but none of the modules it requires for owncloud.

    PHP module zip not installed.
    Please ask your server administrator to install the module.

    PHP module mb multibyte not installed.
    Please ask your server administrator to install the module.

    PHP module GD not installed.
    Please ask your server administrator to install the module.

    PHP module cURL not installed.
    Please ask your server administrator to install the module.

Reinstall all the modules I need, including the LDAP one for user login, restart the Nginx and php services and all is well with the world again.

    $ sudo apt-get install php7.0-zip php7.0-mb php7.0-gd php7.0-curl php7.0-ldap

### Note

> I also checked the owncloud disabled apps and noticed that LDAP had become disabled, but I'm not sure when this happened. So I enabled it and things worked as they should. It did keep all of the LDAP settings I had previously.

 

### References

[https://doc.owncloud.org/server/latest/admin_manual/maintenance/manual_upgrade.html](https://doc.owncloud.org/server/latest/admin_manual/maintenance/manual_upgrade.html) [https://doc.owncloud.org/server/latest/admin_manual/maintenance/upgrade.html](https://doc.owncloud.org/server/latest/admin_manual/maintenance/upgrade.html)
