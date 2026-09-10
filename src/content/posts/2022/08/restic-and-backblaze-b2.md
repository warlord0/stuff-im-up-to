---
pubDatetime: 2022-08-24T09:58:04Z
modDatetime: 2023-11-07T11:43:49Z
title: "Restic and Backblaze B2"
tags:
  - "backup"
  - "Linux"
heroImage: "/blog-media/2022/08/backblaze.png"
description: "Setting up restic as per the instructions on Backblaze didn't work exactly as planned. The environment variables needed to be changed from B2_ACCOUNT_ID an"
---
Setting up restic as per the [instructions on Backblaze](https://help.backblaze.com/hc/en-us/articles/4403944998811) didn't work exactly as planned.

The environment variables needed to be changed from `B2_ACCOUNT_ID` and `B2_ACCOUNT_KEY` to `B2_APPLICATION_KEY_ID` and `B2_APPLICATION_KEY`. This may be down to the version of the b2 binary I'm using.

To get things going, download the binary from the [Backblaze site](https://www.backblaze.com/b2/docs/quick_command_line.html), and put into your path somewhere, eg. `/usr/local/bin/b2`, make sure it's executable with `chmod ugo+x`.

On the Backblaze web admin console, create an application key for restic to use. Copy it, and we need to place it into our environment file below. You will see it only once, so copy it and put it somewhere safe.

Create a file with all the environment details in `/etc/restic-env` and make sure only root can read it, `chown root:` and `chmod 600`.

```
export B2_APPLICATION_KEY_ID="SecretKeyId"
export B2_APPLICATION_KEY="SecretKey"
export RESTIC_REPOSITORY="b2:RepositoryName"
export RESTIC_PASSWORD_FILE=/etc/restic-password
```

You will need to specify a unique repository name, no one else should have the same. If someone else already has taken it you will see an error when you try to `init` the repository.

Create another file (again only allow root to read it) `/etc/restic-password` and put into it a strong password to use to encrypt your backups. If you lose this, you lose all ability to read from your backups - so keep it very safe!

I generate a strong password using:

```
openssl rand -base64 64 | tr -d \\n | tr -d '[:punct:]' 
```

## Initialise the Backup Repository

```
source /etc/restic-env
restic init
```

This will use the variables from `/etc/restic-env` and try to create the repository you specified.

Create a backup script in `/root/restic-backup` and make it executable (`chmod +x`).

```
#!/bin/bash

source /etc/restic-env

restic backup --one-file-system --exclude-caches --exclude-file=/etc/restic-exclude /home/myuser
```

Create a file to exclude folders from the backup as `/etc/restic-exclude`. I exclude all `.` paths and my Downloads folder:

```
.*
Downloads
```

As root, you should be able to run a backup now:

```
/root/restic-backup
```

## Scheduling with systemd

Create the files

#### /etc/systemd/system/restic-backup.timer

```
[Unit]
Description=Restic Weekly Backup

[Timer]
OnCalendar=weekly
Persistent=true

[Install]
WantedBy=timers.target
```

#### /etc/systemd/system/restic-backup.service

```
[Unit] 
Description=Restic Backup

[Service] 
Type=simple 
User=root  

ExecStart=/root/restic-backup

[Install] 
WantedBy=multi-user.target
```

Start and enable the timer.

```
systemctl enable restic-backup.timer --now
```

List the timers to show when yours will trigger.

```
systemctl list-timers
```

## Restoring

To restore, you mount the backup repository onto your file system.

```
mkdir /mnt/restic
source /etc/restic-env
restic mount /mnt/restic
```

Then you can browse the folder and copy files from it as required.

```
# ls -l /mnt/restic/snapshots/
total 1
dr-xr-xr-x 2 root root  0 Aug 24 09:44 2022-08-24T09:44:47+01:00
dr-xr-xr-x 2 root root  0 Aug 24 10:03 2022-08-24T10:03:40+01:00
lrwxrwxrwx 1 root root 25 Aug 24 10:03 latest -> 2022-08-24T10:03:40+01:00
```

## Restic Keys (Passwords)

I foolishly managed to create and initialise my restic backups with the literal key '\<restic-encryption-password\>' - yes, I know, not clever. But I didn't realise until I was checking and documenting my setup.

Fortunately, changing a key isn't difficult, even if the instructions were a little hard to find. You don't actually change a key, you add a new one, and remove the wrong one.

```
source /etc/restic-env
```

Then proceed to run your restic commands to list keys, add and remove as required.

```
restic key help
restic key add
restic key list
repository 69bf7dec opened (version 2, compression level auto)
 ID        User  Host        Created
------------------------------------------------
*3c66466c  root  myhost      2023-11-07 11:34:34
 7533b055  root  myhost      2023-11-07 11:11:47
------------------------------------------------

restic key remove 7533b055
```
