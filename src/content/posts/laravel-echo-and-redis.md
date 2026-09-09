---
pubDatetime: 2019-03-18T15:48:22Z
modDatetime: 2019-03-18T16:06:44Z
title: "Laravel Echo and Redis"
tags:
  - "JavaScript"
  - "Laravel"
  - "Linux"
  - "Web"
description: "The corporate app just got made a bit smarter. In order to alert users that something has happened that they should be aware of we've added real time notif"
---
The corporate app just got made a bit smarter.

In order to alert users that something has happened that they should be aware of we've added real time notifications. We could have polled a table for notifications, but a far smarter development is to use real time communications with [socket.io](https://socket.io/).

Laravel already has these capabilities, but needs to leverage a couple of other services outside of your web server. Notably, [Laravel Echo](https://laravel.com/docs/5.5/broadcasting#receiving-broadcasts) and a message broker such as Pusher or Redis. We chose [Redis](https://redis.io/).

### Install Redis

Redis is available to install directly in Debian Linux straight from the Debian repository.

```
$ sudo apt-get install redis-server
```

This then sits listening on the localhost (127.0.0.1) interface on TCP port 6379. So it's fairly safe from external influences as only localhost can get to it.

### Install Laravel Echo Server

The Echo server is a Node.js (JavaScript) module, so you'll need to install Node first. Not something we had on our productions systems - until now.

Install the Echo server globally:

```
$ sudo npm install -g laravel-echo-server
```

Now you'll need to initialise a configuration file for it. We do this by passing the `init` parameter from within the project folder.

```
$ laravel-echo-server init
```

This will ask a number of questions about how to configure it.

```
 ? Do you want to run this server in development mode? No
 ? Which port would you like to serve from? 6001
 ? Which database would you like to use to store presence channel members? redis
 ? Enter the host of your Laravel authentication server. https://localhost
 ? Will you be serving on http or https? https
 ? Enter the path to your SSL cert file. /etc/ssl/certs/mycert.pem
 ? Enter the path to your SSL key file. /etc/ssl/private/mycert.key
 ? Do you want to generate a client ID/Key for HTTP API? Yes
 ? Do you want to setup cross domain access to the API? No
 ? What do you want this config to be saved as? laravel-echo-server.json
 appId: 82def10ca6e9b844
 key: d7e1054cd2e544dd034ed8b13de93fe
 Configuration file saved. Run laravel-echo-server start to run server.
```

I put it into **https** mode for security and we can use the same certificate and key as the web server.

### Create the Notifications Table

In order for Laravel to handle notifications it needs a table to store them in. This is created using `artisan`.

```
$ php artisan notifications:table
```

This will create the database migration which you will need to trigger using migrate.

```
$ php artisan migrate
```

### Using Supervisord

Starting the echo server is as above, just run it with the `start` parameter. However, when you go into production you'll want this to run as a service, not a console application.

We're already using [`supervisord`](https://laravel.com/docs/5.5/queues#supervisor-configuration) to handle the Laravel queues for email etc. Making use of this same program enables us to run the Echo server too.

> The problem here will be that your web server user may not have access to the folder `/etc/ssl/private` to make use of the private key. In our case I had to grant read access to the group `www-data` to the path and private key.

Create a supervisor configuration file under `/etc/supervisor/conf.d` called `echo-server.conf` and place in the following config, pointing to your project folder.

```
[program:echo-server]
directory=/var/www/myproject/
command=/usr/bin/laravel-echo-server start
autostart=true
autorestart=true
user=www-data
redirect_stderr=true
stdout_logfile=/var/www/myproject/storage/logs/echoserver.log
```

Now I just restart/reload supervisor and the echo server starts up. Pay attention to the log file for errors. This is how I knew I had to fix the permissions on my certificates.

```
$ sudo supervisorctl reload
```

```
L A R A V E L  E C H O  S E R V E R

version 1.5.0
Starting server…

 ✔  Running at localhost on port 6001
 ✔  Listening for http events…
 ✔  Listening for redis events…

Server ready!
```

```
$ sudo supervisorctl status

 echo-server                        RUNNING   pid 29336, uptime 0:00:05
 laravel-worker:laravel-worker_00   RUNNING   pid 29331, uptime 0:00:05
 laravel-worker:laravel-worker_01   RUNNING   pid 29332, uptime 0:00:05
 laravel-worker:laravel-worker_02   RUNNING   pid 29333, uptime 0:00:05
 laravel-worker:laravel-worker_03   RUNNING   pid 29334, uptime 0:00:05
```

\
