---
pubDatetime: 2016-09-20T08:50:57Z
modDatetime: 2016-09-20T08:56:02Z
title: "NGINX and Laravel"
tags:
  - "Laravel"
  - "Linux"
  - "nginx"
heroImage: "/blog-media/2016/09/laravel.jpg"
description: "NGINX needs a little special setup to handle Laravel as Laravel only really serves one page. All others are served through index.php as a route."
---
NGINX needs a little special setup to handle Laravel as Laravel only really serves one page. All others are served through index.php as a route.

    index index.php;

    location / {
        # First attempt to serve request as file, then
        # as directory, then fall back to displaying index.php.
        try_files $uri $uri/ /index.php$query_string;
    }

They key parts here are serve index.php as the index page and then using try files when it can't find \$uri serve up index.php and pass the \$query_string as the parameters. A more complete NGINX site config file:

    server {
        listen 80;
        listen [::]:80;
        return 301 https://$host/$request_uri;
    }

    server {

        # SSL configuration    
        listen 443 ssl;
        listen [::]:443 ssl;
        server_name laravel.mydomain.local;
        
        include snippets/ssl.conf;
        add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

        # Add index.php to the list if you are using PHP
        index index.php;

        location / {
            # First attempt to serve request as file, then
            # as directory, then fall back to displaying index.php.
            try_files $uri $uri/ /index.php$query_string;
        }

        # pass the PHP scripts to FastCGI server
        location ~ \.php$ {
            include snippets/fastcgi-php.conf;
            # With php5-fpm:
            fastcgi_pass unix:/var/run/php5-fpm.sock;
        }
    }

This serves the site as https and forwards any request to http to https. Further it then sends the HSTS header that tells the browser this site always uses https.
