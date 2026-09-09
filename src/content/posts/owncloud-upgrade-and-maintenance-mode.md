---
pubDatetime: 2017-05-22T09:12:32Z
title: "Owncloud Upgrade and Maintenance Mode"
tags:
  - "Linux"
  - "owncloud"
  - "php"
  - "Web"
description: "$ cd /var/www/html/owncloud $ sudo -u www-data php occ upgrade $ sudo -u www-data php occ maintenance:mode --off"
---
This catches me out almost every time I do an update of our Owncloud server. As it's using a Debian repository a simple `apt-get upgrade` is all it takes to deploy the Owncloud upgrade, but then it sticks in maintenance mode and the upgrade hasn't really run. It's just downloaded and waiting deployment. To complete the process you need to run the Owncloud CLI client and trigger the upgrade process. This upgrades the database schema as necessary. Then you can take it out of maintenance mode to allow users to continue.

    $ cd /var/www/html/owncloud
    $ sudo -u www-data php occ upgrade
    $ sudo -u www-data php occ maintenance:mode --off

- Check that the Owncloud path is correct as your installation may be different.
