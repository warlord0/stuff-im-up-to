---
pubDatetime: 2020-08-14T18:25:45Z
modDatetime: 2020-08-15T12:51:13Z
title: "Libc6 and OpenSSH"
tags:
  - "Linux"
description: "This morning was pretty much written off by some nasty occurrence I didn't pay attention to yesterday. Whilst trying to fix gimp with lots of apt manipulat"
---
This morning was pretty much written off by some nasty occurrence I didn't pay attention to yesterday.

Whilst trying to fix gimp with lots of apt manipulation I saw a message saying that mention that `openssh-sftp-server` was no longer required and could be removed using autoremove. I should have checked that out. Because today when I tried to logon to my PC remotely there was no ssh!

Luckily a fellow admin was in the office and able to try to reinstall `openssh-server` for me, only to be presented with a message stating that `libc6` was preventing the version of `openssh-server` from being installed.

```
libc6 : Breaks: openssh-server (< 1:8.1p1-5) but 1:7.9p1-10+deb10u2 is to be installed
```

After doing the dirty and installing telnet so I could get to it via another system I was able to take over.

This is a Debian Buster install and after poking around I find that for some reason `libc6` has been installed from `unstable`! No idea why.

```
apt search libc6 | grep -i installed
```

Now this is one of the reason I love Linux. Let's have a look in the apt cache for what's bee installed:

```
$ ls -lh /var/cache/apt/archives/libc6_2*                                                                                    
-rw-r--r-- 1 root root 2.7M Mar 12 00:13 /var/cache/apt/archives/libc6_2.30-1_amd64.deb
-rw-r--r-- 1 root root 2.7M Mar 13 00:43 /var/cache/apt/archives/libc6_2.30-2_amd64.deb
-rw-r--r-- 1 root root 2.7M Mar 25 15:26 /var/cache/apt/archives/libc6_2.30-4_amd64.deb
-rw-r--r-- 1 root root 2.7M May  5 00:12 /var/cache/apt/archives/libc6_2.30-5_amd64.deb
-rw-r--r-- 1 root root 2.7M May  5 20:43 /var/cache/apt/archives/libc6_2.30-7_amd64.deb
-rw-r--r-- 1 root root 2.7M May 11 10:57 /var/cache/apt/archives/libc6_2.30-8_amd64.deb
-rw-r--r-- 1 root root 2.8M Jul 13 22:27 /var/cache/apt/archives/libc6_2.31-1_amd64.deb
-rw-r--r-- 1 root root 2.8M Jul 23 02:57 /var/cache/apt/archives/libc6_2.31-2_amd64.deb
-rw-r--r-- 1 root root 2.8M Aug  4 17:43 /var/cache/apt/archives/libc6_2.31-3_amd64.deb
```

First off I reinstalled an older version of 2.31 and eventually wished I hadn't. After reinstalling `openssh-server` and things looked to be working, they aren't - but the `sshd` service is running, but just disconnecting me as soon as I connect!

I turned on debugging by setting `SSHD_OPTS=-dddd` in `/etc/default/sshd` and things actually got a bit worse. Now the service would crash when I tried to connect, but at least I got some logs.

```
Aug 14 10:38:46 desktop-11 sshd[10197]: debug1: PAM: cleanup
Aug 14 10:38:46 desktop-11 sshd[10197]: debug3: PAM: sshpam_thread_cleanup entering
Aug 14 10:38:46 desktop-11 sshd[10197]: debug1: Killing privsep child 10229
Aug 14 10:38:46 desktop-11 sshd[10197]: debug1: audit_event: unhandled event 12
Aug 14 10:38:46 desktop-11 systemd[1]: ssh.service: Main process exited, code=exited, status=255/EXCEPTION
Aug 14 10:38:46 desktop-11 systemd[1]: ssh.service: Failed with result 'exit-code'.
```

It didn't yield anything particularly useful.

I did an `apt purge openssh-server`, reinstalled - no success, `dpkg-reconfigure openssh-server` - still no luck.

Let's take `libc6` back a bit further:

```
sudo dpkg -i /var/cache/apt/archives/libc6_2.30-8_amd64.deb
```

I should have just gone with the latest 2.30 earlier! Because now when I start sshd it runs and I can connect! The story doesn't end here though, because I rebooted and sshd failed to start on reboot. Let's look at the logs:

```
Aug 14 11:00:11 desktop-11 sshd[621]: Privilege separation user sshd does not exist
Aug 14 11:00:11 desktop-11 systemd[1]: ssh.service: Control process exited, code=exited, status=255/EXCEPTION
Aug 14 11:00:11 desktop-11 systemd[1]: ssh.service: Failed with result 'exit-code'.
Aug 14 11:00:11 desktop-11 systemd[1]: Failed to start OpenBSD Secure Shell server.
```

"Privilege separation user sshd does not exist" - let's just create that use then and try again.

```
sudo useradd sshd
```

> Success! I have a working `sshd` even after a reboot.

What happens if I run an `apt upgrade`? Bad news, it tries to reinstall the `libc6` from unstable again. Time for some apt pinning. Before I got there I found the `99pin-unstable` waiting for me! I don't recall putting this in - I guess I should really use some auditing tools.

#### /etc/apt/preferences.d/99pin-unstable

```
Package: *
Pin: release a=stable
Pin-Priority: 900

Package: /libc6/
Pin: version 2.30-8
Pin-Priority: 901

Package: *
Pin release a=unstable
Pin-Priority: 10
```

I added in the section for the `/libc6/` package to make sure it doesn't upgrade for now. I need to figure out where this preferences file came from as it doesn't exist on my other Buster systems.

But as things transpired it was just easier to remove the whole `99-pin-unstable` file and leave things to the stable build only, as he next problem I found were `libc-bin` and `locales`:

```
The following packages have unmet dependencies:
 libc-bin : Depends: libc6 (> 2.31) but 2.30-8 is installed
The following packages have unmet dependencies:
 locales : Depends: libc-bin (> 2.31) but 2.30-8 is to be installed
```

These required the same downgrade treatment.

```
sudo dpkg -i /var/cache/apt/archives/libc-bin_2.30-8_amd64.deb
sudo dpkg -i /var/cache/apt/archives/locales_2.30-8_all.deb
```

## Problem Creating User

There's no need to read further as the above solved the issue, but on our system I could not create the `sshd` user because it already exists. Looking at `/etc/passwd` they don't, using `getent passwd sshd` they do. We have a user called `sshd` in our LDAP.

There were two options here. disable LDAP on the PC or rename the user in LDAP. The rename took less than a second - I created the local user - changed the ldap user back. Now I have a user that is available during a reboot.
