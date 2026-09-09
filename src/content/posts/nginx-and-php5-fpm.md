---
pubDatetime: 2016-09-20T13:12:06Z
modDatetime: 2016-09-23T13:17:32Z
title: "NGINX and php5-fpm"
tags:
  - "Linux"
  - "nginx"
  - "php"
description: "This new version of NGINX is tending to be a bit of a pain in terms of installation. Gone are the sites-available and sites-enabled folders and it does a c"
---
This new version of NGINX is tending to be a bit of a pain in terms of installation. Gone are the sites-available and sites-enabled folders and it does a couple of things during installation that really grips my goat. Getting php5-fpm working with it needs some manipulation of the config. The site configs are now located under /etc/nginx/conf.d/ and they now have a .conf extension. The default being default.conf. By default this config sticks the 'root' directive under the location /. Which when it comes to running php5-fpm and using fastcgi parameters causes a headache. It's a simple fix, but put simply the previous use of \$document_root will not work because the directive needs to be within the server context NOT location. This will cause "File not found" messages and in the /var/log/nginx/error.log you find stuff that looks like this:

    2016/09/20 13:51:18 [error] 4361#4361: *4 FastCGI sent in stderr: "Primary script unknown" while reading response header from upstream, client: 271.21.41.201, server: localhost, request: "GET / HTTP/1.1", upstream: "fastcgi://unix:/var/run/php5-fpm.sock:", host: "myserver"

So just move the root line out so it's outside the location context.

        location / {
            root   /usr/share/nginx/html;
            index  index.php;
        }

So it's like this:

        root   /usr/share/nginx/html;
        location / {
              index  index.php;
          }

Next you'll need to sort out the php location, because by default that's different too. This is how you could do it so it was as previous:

       # pass the PHP scripts to FastCGI server
        location ~ \.php$ {
            fastcgi_index  index.php;
            fastcgi_param  SCRIPT_FILENAME    $document_root$fastcgi_script_name;
            fastcgi_pass unix:/var/run/php5-fpm.sock;
            include        fastcgi_params;
        }

But because we have a fastcgi_params include, I'd put the line:

    fastcgi_param  SCRIPT_FILENAME    $document_root$fastcgi_script_name;

into /etc/nginx/fastcgi_params instead. So after a bit of re-jigging we're back to a running nginx web server with php5.
