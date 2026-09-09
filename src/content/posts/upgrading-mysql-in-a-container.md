---
pubDatetime: 2020-07-03T07:51:31Z
modDatetime: 2020-07-03T07:51:42Z
title: "Upgrading MySQL in a Container"
tags:
  - "Linux"
  - "mysql"
description: "Upgrading MySQL 5.5 to 5.7 in a docker container set caused me some trouble. Setting the tag to 5.7.30 was all well and good but when I fired up the contai"
---
Upgrading MySQL 5.5 to 5.7 in a docker container set caused me some trouble. Setting the tag to 5.7.30 was all well and good but when I fired up the container MySQL would stop immediately.

Looking at the log I found `The table is probably corrupted` and references to `run mysql_upgrade` which I was expecting to have to do, but how do you do that when the service fails to start and the container is offline?

I needed to run my container and start `mysqld` manually by going into a bash shell as the user mysql (my container service is called 'db').

```
docker-compose run --rm -u mysql db bash
mysql --skip-grant-tables &
mysql_upgrade -uroot
```

It is important you start `mysqld` with the & to spawn a background process so that you can then call the upgrade command. The upgrade will take a while and seems to pause at regular intervals.

If you [bork](https://www.thefreedictionary.com/bork) something you can stop the docker process, but you will then need to delete the Unix socket in order to try again, eg.

```
docker stop name_db_run_1
sudo rm /srv/container-volumes/name/socket/mysqld.*
```
