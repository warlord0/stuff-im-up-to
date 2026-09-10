---
pubDatetime: 2016-09-20T19:19:16Z
modDatetime: 2016-09-20T20:37:39Z
title: "ownCloud"
tags:
  - "Linux"
  - "nginx"
  - "owncloud"
  - "php"
heroImage: "/blog-media/2016/09/2000px-owncloud2-logo-svg.png"
description: "We needed a semi-secure method of transferring files between staff and 3rd parties. To handle those frequent time when someone tries to attach 150MB file onto an email. OwnCloud to the rescue."
---
We needed a semi-secure method of transferring files between staff and 3rd parties. To handle those frequent times when someone tries to attach a 150MB file onto an email. [OwnCloud](https://owncloud.org/) to the rescue. It's come a long way since I first used it. Now it has all kinds of plugins and features. What's good about it is there are clients for pretty much all platforms - many free. Failing that good old HTML will do. Getting it working has always been a bit of a challenge though. Especially as it used to prefer Apache. Now it seems it's NGINX friendly, as long as you follow the documentation. Firstly you'll want a server setup with MySQL, Nginx and php5-fpm that works and serves as it should. Then you can install ownCloud. It's downloadable, but there's also a repository that you can use - which helps keep it up to date. You can find details for the repository here: [https://download.owncloud.org/download/repositories/stable/owncloud/](https://download.owncloud.org/download/repositories/stable/owncloud/https://download.owncloud.org/download/repositories/stable/owncloud/) OwnCloud installs pretty easily from the repo. Then you have to point your Nginx server to use it's root directory. The default is more Apache standard than Nginx as /var/www/owncloud The good people at ownCloud now have an Nginx config ready to go, albeit a few tweaks to suit your environment. Source: [https://doc.owncloud.org/server/9.1/admin_manual/installation/nginx_owncloud_9x.html](https://doc.owncloud.org/server/9.1/admin_manual/installation/nginx_owncloud_9x.html)

    upstream php-handler {
        server 127.0.0.1:9000;
        #server unix:/var/run/php5-fpm.sock;
    }

    server {
        listen 80;
        server_name cloud.example.com;
        # enforce https
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl;
        server_name cloud.example.com;

        ssl_certificate /etc/ssl/nginx/cloud.example.com.crt;
        ssl_certificate_key /etc/ssl/nginx/cloud.example.com.key;

        # Add headers to serve security related headers
        # Before enabling Strict-Transport-Security headers please read into this topic first.
        #add_header Strict-Transport-Security "max-age=15552000; includeSubDomains";
        add_header X-Content-Type-Options nosniff;
        add_header X-Frame-Options "SAMEORIGIN";
        add_header X-XSS-Protection "1; mode=block";
        add_header X-Robots-Tag none;
        add_header X-Download-Options noopen;
        add_header X-Permitted-Cross-Domain-Policies none;

        # Path to the root of your installation
        root /var/www/owncloud/;

        location = /robots.txt {
            allow all;
            log_not_found off;
            access_log off;
        }

        # The following 2 rules are only needed for the user_webfinger app.
        # Uncomment it if you're planning to use this app.
        #rewrite ^/.well-known/host-meta /public.php?service=host-meta last;
        #rewrite ^/.well-known/host-meta.json /public.php?service=host-meta-json last;

        location = /.well-known/carddav {
            return 301 $scheme://$host/remote.php/dav;
        }
        location = /.well-known/caldav {
            return 301 $scheme://$host/remote.php/dav;
        }

        location /.well-known/acme-challenge { }

        # set max upload size
        client_max_body_size 512M;
        fastcgi_buffers 64 4K;

        # Disable gzip to avoid the removal of the ETag header
        gzip off;

        # Uncomment if your server is build with the ngx_pagespeed module
        # This module is currently not supported.
        #pagespeed off;

        error_page 403 /core/templates/403.php;
        error_page 404 /core/templates/404.php;

        location / {
            rewrite ^ /index.php$uri;
        }

        location ~ ^/(?:build|tests|config|lib|3rdparty|templates|data)/ {
            return 404;
        }
        location ~ ^/(?:\.|autotest|occ|issue|indie|db_|console) {
            return 404;
        }

        location ~ ^/(?:index|remote|public|cron|core/ajax/update|status|ocs/v[12]|updater/.+|ocs-provider/.+|core/templates/40[34])\.php(?:$|/) {
            fastcgi_split_path_info ^(.+\.php)(/.*)$;
            include fastcgi_params;
            fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
            fastcgi_param PATH_INFO $fastcgi_path_info;
            fastcgi_param HTTPS on;
            fastcgi_param modHeadersAvailable true; #Avoid sending the security headers twice
            fastcgi_param front_controller_active true;
            fastcgi_pass php-handler;
            fastcgi_intercept_errors on;
            fastcgi_request_buffering off;
        }

        location ~ ^/(?:updater|ocs-provider)(?:$|/) {
            try_files $uri/ =404;
            index index.php;
        }

        # Adding the cache control header for js and css files
        # Make sure it is BELOW the PHP block
        location ~* \.(?:css|js)$ {
            try_files $uri /index.php$uri$is_args$args;
            add_header Cache-Control "public, max-age=7200";
            # Add headers to serve security related headers (It is intended to have those duplicated to the ones above)
            # Before enabling Strict-Transport-Security headers please read into this topic first.
            #add_header Strict-Transport-Security "max-age=15552000; includeSubDomains";
            add_header X-Content-Type-Options nosniff;
            add_header X-Frame-Options "SAMEORIGIN";
            add_header X-XSS-Protection "1; mode=block";
            add_header X-Robots-Tag none;
            add_header X-Download-Options noopen;
            add_header X-Permitted-Cross-Domain-Policies none;
            # Optional: Don't log access to assets
            access_log off;
        }

        location ~* \.(?:svg|gif|png|html|ttf|woff|ico|jpg|jpeg)$ {
            try_files $uri /index.php$uri$is_args$args;
            # Optional: Don't log access to other assets
            access_log off;
        }
    }

Make sure you set your server_name and change the ssl keys to suit your own. You are using https right? You can use plain http if you modify the config to suit, don't forget to comment out the 'fastcgi_param HTTPS on;' line if you're going to do this for "testing". Also if you're using https uncomment the line '#add_header Strict-Transport-Security'. This feature is only available in the newer releases of Nginx (hence the use of the Nginx repository). This tells the client not to bother even trying http in future. So now you have Nginx running and OwnClound installed, you'll want to setup a database - hence the MySQL part. Create an empty database and a user that has full permission to it. OwnCloud will do the rest.

    $ mysql -u root -p
    mysql> create database owncloud;
    mysql> grant all on owncloud.* to owncloud@localhost identified by 'MySecretPassword';
    mysql> \q

Now visit your servers web page. You'll need to pay attention to the install wizard as it asks you for a new admin user and password, but underneath it you'll want to click MySQL/MariaDB to use MySQL - as the default is SQLite.

### Finishing it off

That should do it. You'll have a working ownCloud server... but there are a few things you should do to finish up. When you visit the Admin page you may get some issues show up about not being able to use getenv(), not being able to access the internet (if you're proxied) and having no cache set up. You'd also get a complaint about using http if you are, and also not having the HSTS header set if you're using https and didn't uncomment that line above. **Fixing getenv()** - edit the file /etc/php5/fpm/pool.d/www.conf and uncomment the line:

    ;env[PATH] = /usr/local/bin:/usr/bin:/bin

**Set your proxy** by editting /var/www/owncloud/config/config.php and adding in your proxy in the form of:

    'proxy' => 'http://192.168.0.55:3128',

**Using Memcached** is detailed in the [ownCloud docs](https://doc.owncloud.org/server/9.1/admin_manual/configuration_server/caching_configuration.html). But I found it confusing. What it came down to was installing memcached and php5-memcached and adding this into the config.php file:

    'memcache.local' => 'OC\Memcache\Memcached',

The php class pretty much figures out that it should use localhost on tcp port 11211 so nothing to do beyond that. Installing memcache

    $ sudo apt-get install memcached php5-memcached

With all that sorted you should now be able to use ownCloud without issue.

### Recommendation

One thing I would recommend is using the excellent LDAP addon that comes shipped with ownCloud. It's very easy to configure from within the web GUI. If you do you'll want to install php5-ldap.

    $ sudo apt-get install php5-ldap

If you have hundreds of users I'd advise you get creative with the LDAP queries to filter them down a bit and even use a group that you have to grant membership to let them access to use ownCloud. If not the list of users in the admin panel becomes very unwieldy.
