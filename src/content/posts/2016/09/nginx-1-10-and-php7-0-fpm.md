---
pubDatetime: 2016-09-23T13:08:38Z
modDatetime: 2016-09-23T13:38:04Z
title: "Nginx 1.10 and PHP7.0-fpm"
tags:
  - "Linux"
  - "nginx"
  - "php"
heroImage: "/blog-media/2016/09/2000px-nginx_logo-svg.png"
description: "Keen to press on a try new suff I figured that seeing as I'd now tried Nginx 1.10 that I'd put that together with PHP 7.0. I started of by thinking I'd rem"
---
Keen to press on a try new suff I figured that seeing as I'd now tried Nginx 1.10 that I'd put that together with PHP 7.0. I started of by thinking I'd remove nginx 1.6 from my workstation, clean the config out and install the latest from the nginx repository. It was all going so well until:

    Unpacking nginx (1.10.1-1~jessie) ...
    dpkg: error processing archive /var/cache/apt/archives/nginx_1.10.1-1~jessie_amd64.deb (--unpack):
     trying to overwrite '/usr/share/nginx/html/index.html', which is also in package nginx-common 1.6.2-5+deb8u2
    dpkg-deb: error: subprocess paste was killed by signal (Broken pipe)
    Errors were encountered while processing:
     /var/cache/apt/archives/nginx_1.10.1-1~jessie_amd64.deb
    E: Sub-process /usr/bin/dpkg returned an error code (1)

I wasn't even using the default path /usr/share/nginx so quickly deleted it and tried again. Same error.

    $ sudo apt-get remove nginx
    $ sudo apt-get purge nginx

Said nginx wasn't installed, but try as I might I couldn't get it to install from the repo. turns out nginx isn't alone, it also either has nginx-common and/or nginx-full to go with it.

    $ sudo apt-get purge nginx-common nginx-full

Job done, now nginx 1.10 installs from the repo. As PHP 7.0 isn't currently in the official Debian repos you need to add the dotdeb repositories to get it. Create /etc/apt/sources.d/nginx.list

    deb http://packages.dotdeb.org jessie all
    deb-src http://packages.dotdeb.org jessie all

then add the dotdeb key to the keyring:

    $ sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys ABF5BD827BD9BF62

Then it's a regular apt-get install if you want Apache bundled into it! If you don't want Apache - who does? nginx rocks. Just install the fpm which will drag only the nginx dependencies required.

> \$ sudo apt-get install php7.0-fpm

You may also want to add in your other php modules like php7.0-mysql, php7.0-ldap and php7.0-xml *- and if you're using Laravel and composer.phar php7.0-mbstring.* Then it's just a subtle change in your nginx config - which is now located in /etc/nginx/conf.d/default.conf to add in the php7.0-fpm like so:

    fastcgi_pass unix:/var/run/php/php7.0-fpm.sock;

Don't forget, you may still have to work out the root entry and fastcgi_params as per [NGINX and php5-fpm](/posts/nginx-and-php5-fpm/) You may also notice that this hasn't impacted on your php 5 setup at all. Seems you can run both, which may be useful if you have different virtual web servers with specific requirements.
