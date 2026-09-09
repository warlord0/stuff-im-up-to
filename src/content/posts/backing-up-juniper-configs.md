---
pubDatetime: 2016-03-01T07:25:13Z
modDatetime: 2016-09-19T16:35:55Z
title: "Backing Up Juniper Configs"
tags:
  - "firewall"
  - "juniper"
  - "Networking"
  - "Security"
description: "Spent ages looking at various options including rconfig and Laravel SSH, but had to surrender. Eventually figured out it couldn't be simpler! Setup an Open"
---
Spent ages looking at various options including rconfig and Laravel SSH, but had to surrender. Eventually figured out it couldn't be simpler! Setup an OpenSSH DSA key and import the public key onto the Juniper for a user account with read-only privileges. Very important the type is DSA NOT RSA - so generate the key using:

    # ssh-keygen -t dsa

The resulting public key will then start with ssh-dss which is the only way I got it to import onto the Juniper. Then it's a simple case of using scp from the command line to logon and retrieve the file ns_sys_config into a local file eg:

    # scp -i mynewkeyfile myusername@juniper:ns_sys_config ./backup.cfg

I then create a script to process the two firewalls we have like this and added, it to a cron :

    #!/bin/bash

    NOW=$(date +"%Y%m%d")
     CPATH=/root/configmgr/

    devices=( juniper1 juniper2 )

    for i in "${devices[@]}"
     do

    echo $i
     file=$CPATH/files/$NOW-$i.cfg
     scp -i $CPATH/configmgr configmgr@$i:ns_sys_config "$file"

    done
