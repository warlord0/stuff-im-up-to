---
pubDatetime: 2016-09-29T06:57:16Z
title: "NGINX, PHP and a Blank Page"
tags:
  - "nginx"
  - "php"
description: "Got Nginx installed, got PHP installed. All ready to go, but all you get from your test PHP page is... nothing. Catches me out regularly. The php5-fpm daem"
---
Got Nginx installed, got PHP installed. All ready to go, but all you get from your test PHP page is... nothing. Catches me out regularly. The php5-fpm daemon runs as the user "www-data", but the Nginx daemon runs as "nginx". So Nginx has no permission to the /var/run/php5-fpm.sock file because it's owned by "www-data". You could mess with file permissions, but I find it easier to just change the user id of the Nginx daemon. Edit the file /etc/nginx/nginx.conf Pretty much the top line, change it from:

    user  nginx;

to

    user  www-data;

Then

    $ sudo systemctl restart nginx

and all is well with the world once more.
