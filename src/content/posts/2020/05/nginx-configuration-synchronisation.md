---
pubDatetime: 2020-05-25T21:31:09Z
modDatetime: 2020-05-25T21:35:13Z
title: "Nginx Configuration Synchronisation"
tags:
  - "Linux"
  - "nginx"
  - "rsync"
  - "ssh"
  - "Web"
heroImage: "/blog-media/2016/09/2000px-nginx_logo-svg.png"
description: "Back when I built the Nginx failovers using Nginx and Keepalived I also required that should the config change on the master then the config would automati"
---
Back when I built the Nginx failovers using [Nginx and Keepalived](/posts/nginx-and-keepalived/) I also required that should the config change on the master then the config would automatically be copied to the backup.

There are some important things you need to do for this to work correctly and not put your failover at risk of failing. The last thing you want to do is bork you master servers config and automatically copy a filed config to the backup server and screw that one up too.

First I want to spot any changes in my `/etc/nginx/` folders and mirror them to the backup. But only after the changes pass the nginx config test using `nginx -t`.

Then when I mirror the files I need to remove any files that don't exist on the master and then reload nginx on the backup.

To do this I'm going to continuously watch the folder using inotifywait. Then on a change copy the files to the backup using `rsync`. I'll need to install some packages.

```
sudo apt install inotify-tools rsync
```

## Configure SSH

In order to copy files I'll need root permissions and I'll need to add the following line into my backup hosts `/etc/ssh/sshd_config`:

```
PermitRootLogin prohibit-password
```

Then create an ssh keypair for root without using a password on my master using:

```
sudo ssh-keygen -t 4096
```

I then paste the contents of the `/root/.ssh/id_rsa.pub` from my master into the `/root/.ssh/authorized_keys` on the backup.

I should then be able to connect from the master to the backup without using a password when I use:

```
sudo ssh backup
```

I'll be asked to confirm the host key the first time only.

## Add the Script

Add the watcher script into a folder in the root users path and make it executable, eg.

#### /bin/watcher.sh

```
#!/bin/bash

WATCH_FOLDER=/etc/nginx
TARGET_HOST=backup

inotifywait -rmq --event modify --event create --event delete ${WATCH_FOLDER} | \
  while read dir evt file; do
    # Ignore specified extensions
    if [[ ! $file =~ .*(swp|swx|~)$ ]]; then 
      echo "Nginx configuration changed"
      nginx -t
      if [ $? -eq 0 ]; then
        echo "Nginx tested successfully"
        systemctl reload nginx
        if [ -z "`/bin/pidof nginx`" ]; then
          echo "Nginx reload failed!"
        else
          echo "Nginx reloaded."
          rsync -avrz --delete ${WATCH_FOLDER}/ \
            ${TARGET_HOST}:${WATCH_FOLDER}
          ssh ${TARGET_HOST} systemctl reload nginx
        fi
      else
        echo "Nginx test FAILED!"
      fi
    fi
  done
```

## Create the Service

We need this script running all the time so let's create a service for it. Create the file:

#### /etc/systemd/system/watcher.service

```
[Unit]
Description=Nginx config watcher
After=network.target
StartLimitIntervalSec=0

[Service]
Type=simple
Restart=always
RestartSec=1
User=root
ExecStart=/bin/watcher.sh

[Install]
WantedBy=multi-user.target
```

Enable it and start it:

```
sudo systemctl enable watcher.service
sudo systemctl start watcher.service
```

## Testing

All that's left is making some changes in the nginx config, eg. create a file in `/etc/nginx/conf.d` - ensure it's a valid config file. Just start everyline with a comment to see it in testing.

Monitor your syslog file to see the changes get logged:

```
sudo tail -f /var/log/syslog
```

```
May 25 22:33:32 nginx1 watcher.sh[3101]: Nginx configuration changed
May 25 22:33:32 nginx1 watcher.sh[3101]: nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
May 25 22:33:32 nginx1 watcher.sh[3101]: nginx: configuration file /etc/nginx/nginx.conf test is successful
May 25 22:33:32 nginx1 watcher.sh[3101]: Nginx tested successfully
May 25 22:33:32 nginx1 systemd[1]: Reloading A high performance web server and a reverse proxy server.
May 25 22:33:32 nginx1 systemd[1]: Reloaded A high performance web server and a reverse proxy server.
May 25 22:33:32 nginx1 watcher.sh[3101]: Nginx reloaded.
May 25 22:33:32 nginx1 watcher.sh[3101]: sending incremental file list
May 25 22:33:32 nginx1 watcher.sh[3101]: deleting conf.d/.test.conf.swp
May 25 22:33:32 nginx1 watcher.sh[3101]: conf.d/
May 25 22:33:32 nginx1 watcher.sh[3101]: conf.d/test.conf
May 25 22:33:32 nginx1 watcher.sh[3101]: sent 1,558 bytes  received 75 bytes  3,266.00 bytes/sec
May 25 22:33:32 nginx1 watcher.sh[3101]: total size is 20,805  speedup is 12.74
```

## Further Development

The next steps from here are to add in the Let's Encrypt folders too. That way our certificates get updated between the servers when certbot renews them.
