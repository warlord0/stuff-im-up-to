---
pubDatetime: 2017-09-19T10:03:04Z
modDatetime: 2017-09-19T14:06:11Z
title: "OwnCloud, php7.0-fpm and Memcache"
tags:
  - "Linux"
  - "owncloud"
  - "Web"
heroImage: "/blog-media/2016/09/2000px-owncloud2-logo-svg.png"
description: "When checking out the setup for our OwnCloud system it came up with a few cautionary problems that needed to be resolved. The problems related to environme"
---
When checking out the setup for our OwnCloud system it came up with a few cautionary problems that needed to be resolved. The problems related to environment variables and file locking.

> php does not seem to be setup properly to query system environment variables. The test with getenv("PATH") only returns an empty response. Please check the installation documentation ↗ for php configuration notes and the php configuration of your server, especially when using php-fpm.

and

> Transactional file locking is using the database as locking backend, for best performance it's advised to configure a memcache for locking. See the documentation ↗ for more information.

You can go off trawling the documentation to resolve the issues, but in short it's a simple config change for the `php7.0-fpm` and an install of the `redis-server` and `php-redis php-apcu` modules and a change to the owncloud config. For php7.0 edit the file `/etc/php/7.0/fpm/pool.d/www.conf` and uncomment the `env[PATH]` line. Then restart the `php7.0-fpm` service.

### Enable the PATH environment variable

    $ sudo vi /etc/php/7.0/fpm/pool.d/www,conf
    ...
    env[PATH] = /usr/local/bin:/usr/bin:/bin
    ...

    $ sudo systemctl restart php7.0-fpm.service

### Install Redis

    $ sudo apt-get install redis-server php-redis php-apcu
    $ sudo systemctl restart php7.0-fpm.service

### Enable memcache.locking in Owncloud

Edit the file /var/www/owncloud/config/config.php \$ sudo vi /var/www/owncloud/config/config.php

    ...
    'memcache.local' => '\\OC\\Memcache\\APCu',
     'memcache.locking' => '\\OC\\Memcache\\Redis',
     'redis' => array(
     'host' => 'localhost',
     'port' => 6379,
     ),
    ...

### References

[https://doc.owncloud.org/server/10.0/admin_manual/configuration/server/caching_configuration.html](https://doc.owncloud.org/server/10.0/admin_manual/configuration/server/caching_configuration.html) [https://doc.owncloud.org/server/10.0/admin_manual/installation/configuration_notes_and_tips.html#php-fpm](https://doc.owncloud.org/server/10.0/admin_manual/installation/configuration_notes_and_tips.html#php-fpm)
