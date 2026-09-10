---
pubDatetime: 2018-11-21T08:33:32Z
modDatetime: 2022-01-11T22:45:57Z
title: "Syncing Config Files Between Servers"
tags:
  - "Linux"
  - "nginx"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "Having setup a pair of load balancers I wanted to ensure the Nginx configuration from one system was replicated to the secondary where changes were made on"
---
Having setup a pair of load balancers I wanted to ensure the Nginx configuration from one system was replicated to the secondary where changes were made on the primary.

In this instance my weapon of choice is `lsyncd`. It seems quite old, but stable. It's a layer over rsync and ssh that monitors a directory for changes and copies them over ssh to a target server.

------------------------------------------------------------------------

Getting it working is pretty straight forward once you crack the configuration.

Install it using:

```
$ sudo apt-get install lsyncd
```

Then you'll need to create the config file:

```
$ sudo mkdir /etc/lsyncd
$ sudo mkdir /var/log/lsyncd
$ sudo vi /etc/lsyncd/lsyncd.conf.lua
```

This is what my final config looked like:

```
settings {
  logfile = "/var/log/lsyncd/lsyncd.log",
  statusFile = "/var/log/lsyncd/lsyncd.status"
}

sync {
  default.rsyncssh,
  source = "/etc/nginx",
  host = "loadbal02.domain.local",
  targetdir = "/etc/nginx";
}
```

Outside of this config I needed to setup an ssh key for the root user from loadbal01 to logon to loadbal02. When you generate the key DO NOT specify a password for the key, or the process wont work.

```
$ sudo ssh-keygen
$ sudo cat /root/.ssh/id_rsa.pub
```

Then I copy the output and paste it into `/root/.ssh/authorized_keys` on loadbal02. Many ways of doing this scp, copy/paste, etc.

Then just to ensure it works by connecting at least once to the target host as root using ssh.

```
$ sudo ssh root@loadbal02.domain.local
```

This will ask you to trust and save the hosts id in the `~/.ssh/known_hosts` file so it will be trusted in future. Make sure you connect to EXACTLY the same host name as you are putting into the config file eg. "loadbal02.domain.local" as the host id for "loadbal02"does not match the FQDN and you will get a service error like this:

```
recursive startup rsync: /root/sync/ -> loadbal02.domain.local:/root/sync/
Host key verification failed.
```

Start the service using:

```
$ sudo systemctl start lsyncd
```

and monitor the status and log file to make sure it's doing what you expect.

```
$ sudo cat /var/log/lsyncd/lsyncd.status 

Lsyncd status report at Tue Nov 20 15:33:21 2018
Sync1 source=/etc/nginx/
There are 0 delays
Excluding:
  nothing.
Inotify watching 7 directories
  1: /etc/nginx/
  2: /etc/nginx/sites-available/
  3: /etc/nginx/modules-available/
  4: /etc/nginx/modules-enabled/
  5: /etc/nginx/sites-enabled/
  6: /etc/nginx/conf.d/
  7: /etc/nginx/snippets/
```

### Restarting Nginx on the Secondary

After the files have copied, you need to tell Nginx on the secondary that the config has changed. Then it needs to reload the config so it's running as up to date as the primary.

For this I use `inotify-tools` by installing them on loadbal**02**:

```
$ sudo apt-get install inotify-tools
```

Next I created a shell script that monitors the config and reloads the service.

I created a file called `/usr/sbin/inotify_nginx.sh` and set it as executable.

```
$ sudo touch /usr/sbin/inotify_nginx.sh
$ sudo chmod 700 /usr/sbin/inotify_nginx.sh
$ sudo vi /usr/sbin/inotify_nginx.sh
```

This is the content of my script:

```
!/bin/sh
while true; do
  inotifywait -q -e modify -e close_write -e delete -r /etc/nginx/
  /usr/sbin/nginx -t && systemctl reload nginx
done
```

It monitors the `/etc/nginx/` folder (-r recursively) and any event like modify, close_write or delete will cause the script to continue and reload nginx, then loop around to wait for any more changes.

Next I made sure my script ran every time the server rebooted using `crond`.

```
$ sudo crontab -e
```

Added in a line to run the script at reboot:

```
@reboot /bin/bash /usr/sbin/inotify_nginx.sh
```

That's it. Following a reboot the script runs happily. To monitor it you can look at the nginx error log (`/var/log/nginx/error.log`). This will show a process started event like:

```
2018/11/21 09:16:57 [notice] 736#736: signal process started
```

The only downside of this would be if I spanner the config on primary the service reload on the secondary will fail. eg.

```
2018/11/21 09:25:20 [emerg] 1819#1819: unknown directive "banana" in /etc/nginx/nginx.conf:1
```

This isn't such a concern unless the primary happens to fail whilst you're editing it. The most important part is:

> **Test your config before you reload the primary server!**

```
$ sudo nginx -t
nginx: [emerg] unknown directive "banana" in /etc/nginx/nginx.conf:1
nginx: configuration file /etc/nginx/nginx.conf test failed
```

Then fix any issues before doing a `systemctl reload`.
