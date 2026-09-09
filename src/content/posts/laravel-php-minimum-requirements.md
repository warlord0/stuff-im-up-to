---
pubDatetime: 2017-12-11T14:15:51Z
modDatetime: 2018-07-13T11:21:22Z
title: "Laravel & PHP Minimum Requirements"
tags:
  - "Laravel"
  - "Linux"
  - "php"
  - "Web"
description: "Make sure you've installed php and the necessary modules before trying to create a new Laravel project."
---
Make sure you've installed php and the necessary modules before trying to create a new Laravel project.

    $ sudo apt-get install php-fpm
    $ sudo apt-get install php-mbstring php-zip

The order of `php-fpm` and `php` is important as putting them the other way around you'll find you get `apache2` installed when you probably don't want that. Then you should be able to create your empty project using composer without any complaints.

    $ cd /var/www
    $ composer create-project --prefer-dist laravel/laravel [project]
