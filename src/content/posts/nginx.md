---
pubDatetime: 2016-09-20T08:38:17Z
modDatetime: 2016-09-20T08:39:25Z
title: "NGINX"
tags:
  - "Linux"
  - "nginx"
description: "Absolutely my favourite web server. Small footprint and very fast to get running. First add the repositories to your Debian sources by creating the file /e"
---
Absolutely my favourite web server. Small footprint and very fast to get running. First add the repositories to your Debian sources by creating the file /etc/apt/sources.list.d/nginx.list

    deb http://nginx.org/packages/debian/ jessie nginx
    deb-src http://nginx.org/packages/debian/ jessie nginx

Change the release name as necessary. Then find the ID of the key the repo is signed with so you can add it to the apt key store.

    $ sudo apt-get update

You should see you get a GPG error with the ID of the key you need. Copy this and paste it into the next command to download and install it:

    $ sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys [KEYID]

Job done now just apt update and install. Source: [https://www.nginx.com/resources/wiki/start/topics/tutorials/install/](https://www.nginx.com/resources/wiki/start/topics/tutorials/install/)
