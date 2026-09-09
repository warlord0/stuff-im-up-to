---
pubDatetime: 2020-05-19T12:12:00Z
modDatetime: 2020-05-19T13:16:46Z
title: "Remotely Mounting a Fileshare"
tags:
  - "Linux"
  - "ssh"
description: "Working from home means making use of different technologies to connect to systems in the office. Not all of our file system are available over webdav, and"
---
Working from home means making use of different technologies to connect to systems in the office. Not all of our file system are available over webdav, and I need to connect to the fileshare on a server in the office.

This is where `sshfs` comes in.

`sshfs` allows us to mount a filesystem over ssh. We have the ssh gateway all setup with the necessary security, now all we need to do is install `sshfs`, create a mount point and mount the filesystem.

```
sudo apt install sshfs
sudo mkdir /mnt/fileshare
sudo sshfs -o allow_other,default_permissions fileserver:/srv/fileshare /mnt/fileshare                    
```

Because I'm having to use `sudo` for the mount process, in order for this to work I needed to add into the global `/etc/ssh/ssh_config` details about `fileserver` and what credentials to use.

```
Host fileserver
        HostName fileserver
        User myworkuser
        IdentityFile /home/myuser/.ssh/id_rsa
        ProxyJump gateway.domain.tld:8022
```

When I first tried this I got a successful mount, but then ran into issues as I navigated the structure and found I needed to authenticate. Only trouble was the authentication was using my local user on my home system and not the user account in the office, this was never going to work.

I needed to tell `sshfs` to use my work user account and group id's. I got these from my work PC using:

```
$ id -u
1103
$ id -g
501
```

Then it was just a case of modifying the sshf command to enforce my user id's with `-o idmap=user -o uid=1103 -o gid=501`.

```
sudo sshfs -o allow_other,default_permissions -o idmap=user -o uid=1103 -o gid=501 fileserver:/srv/fileshare /mnt/fileshare
```
