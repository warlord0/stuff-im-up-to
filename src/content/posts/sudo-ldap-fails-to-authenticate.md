---
pubDatetime: 2022-11-16T11:39:56Z
title: "sudo-ldap Fails to Authenticate"
tags:
  - "debian"
  - "ldap"
  - "Linux"
  - "linuxmint"
  - "sudo"
description: "I mainly use two Linux distros - Manjaro and Debian (or Debian based distro Mint). For most remote workers, I rolled out Manjaro with caching authenticatio"
---
I mainly use two Linux distros - Manjaro and Debian (or Debian based distro Mint). For most remote workers, I rolled out Manjaro with caching authentication using SSSD. But this week has been frustrating as I'm delivering remote users on Linux Mint.

First step of the process is getting the users authenticating using LDAP, add on `sudo-ldap` to give them our corporate rule set. Then let the games commence.

I try to use sudo and ...

```
$ sudo ls
[sudo] password for myuser:               
Sorry, user myuser is not allowed to execute '/usr/bin/ls' as root on myhost.
```

What's going on here? I turned on debug logging in `/etc/sudo.conf` and even monitor the OpenLDAP server log to see that queries are being made, and I am getting queries to it.

The sudo debug logging is very chatty, but I do find references in there to suggest it knows who I am and what groups I am in.

```
Nov 16 10:37:47.571 sudo[4212] <- sudo_new_key_val_v1 @ ../../../lib/util/key_val.c:55 := user=myuser/
Nov 16 10:37:47.571 sudo[4212] -> get_user_groups @ ../../src/sudo.c:433
Nov 16 10:37:47.571 sudo[4212] get_user_groups: got 18 groups via getgroups()
Nov 16 10:37:47.571 sudo[4212] <- get_user_groups @ ../../src/sudo.c:490 := groups=154,500,501,502,507,509,511,512,522,524,525,551,552,553,555,557,600,10000
```

```
Nov 16 10:37:47.607 sudo[4212] sudo_get_grlist: user myuser is a member of group access-role-sysadmin
```

Which demonstrates it knows about our LDAP groups. But still no authentication.

I can see what I'm allowed to do by using `sudo --list` or `sudo -l`, use `-ll` for more info.

```
$ sudo -l
Matching Defaults entries for myuser on myhost:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty, pwfeedback

User myuser may run the following commands on myhost:
    (root) NOPASSWD: /usr/bin/mint-refresh-cache
    (root) NOPASSWD: /usr/lib/linuxmint/mintUpdate/synaptic-workaround.py
    (root) NOPASSWD: /usr/lib/linuxmint/mintUpdate/dpkg_lock_check.sh
    (root) NOPASSWD: /usr/bin/mintupdate
```

Something not right here. These are only `sudoers.d` entries to allow updates. Where are the LDAP rules?

It's only after many hours of trawling the net that I find references to `sudo-ldap.conf`. But that's not used on Manjaro as the settings are in `/etc/openldap/ldap.conf` and I have an `/etc/ldap.conf` on Mint. It must be using that, or why would it even be querying LDAP? **WRONG!** I linked `ldap.conf` to `sudo-ldap.conf` to test this out.

```
ln -s /etc/ldap.conf /etc/sudo-ldap.conf
```

Retried `sudo -ll` and now I see what I expect to see and `sudo` works as it should.

```
$ sudo -ll
Matching Defaults entries for myuser on myhost:
    env_reset, mail_badpass,
    secure_path=/usr/local/sbin\:/usr/local/bin\:/usr/sbin\:/usr/bin\:/sbin\:/bin\:/snap/bin,
    use_pty, pwfeedback, insults, syslog=user, mailto=sysadmin@opusvl.com,
    ignore_local_sudoers, mailsub="sudo access report from %h", pwfeedback,
    passprompt="[sudo-ldap] Password for %u on %H:", env_reset

User myuser may run the following commands on myhost:

Sudoers entry:
    RunAsUsers: root
    Options: !authenticate
    Commands:
    /usr/bin/mint-refresh-cache

Sudoers entry:
    RunAsUsers: root
    Options: !authenticate
    Commands:
    /usr/lib/linuxmint/mintUpdate/synaptic-workaround.py

Sudoers entry:
    RunAsUsers: root
    Options: !authenticate
    Commands:
    /usr/lib/linuxmint/mintUpdate/dpkg_lock_check.sh

Sudoers entry:
    RunAsUsers: root
    Options: !authenticate
    Commands:
    /usr/bin/mintupdate

LDAP Role: access-role-sysadmin
    RunAsUsers: ALL
    Options: !authenticate
    Commands:
    ALL
```

```
$ sudo ls 
antigen.zsh  Documents  fileshare  Pictures  Templates
Desktop      Downloads  Music      Public    Videos
```

## TLDR;

```
ln -s /etc/ldap.conf /etc/sudo-ldap.conf
```
