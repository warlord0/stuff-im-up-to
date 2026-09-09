---
pubDatetime: 2016-09-20T07:40:00Z
modDatetime: 2016-10-28T07:56:30Z
title: "rsync"
tags:
  - "backup"
  - "Linux"
  - "rsync"
description: "Good old rsync. Very handy for backing up and entire system to another. It only transfers files that have changed too. rsync -av -e ssh --delete --exclude"
---
Good old rsync. Very handy for backing up and entire system to another. It only transfers files that have changed too.

    rsync -av -e ssh --delete --exclude /tmp --exclude /chroots --exclude /sys --exclude /proc / user@destination::backups/folder

Uses ssh to connect, deletes backed up files that are no longer on the source and excludes a few unnecessary folders. If you have setup .ssh/authorized_keys you wont even need a password. What's even more helpful is that if you have a firewall that restricts traffic to port 22/tcp coming from the source you can use it in reverse and pull the backup from the source to the destination

    rsync -av -e ssh --exclude /sys --exclude /proc user@source:/ ./destination_folder

Add to this that if you have a key file you like to use for ssh to identify you by enclosing the ssh call in single quotes.:

    rsync -av -e 'ssh -i file.key' --exclude /sys --exclude /proc user@source:/ ./destination_folder
