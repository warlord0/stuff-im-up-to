---
pubDatetime: 2021-04-12T19:58:51Z
title: "NFSv4 and IDMAPD"
tags:
  - "ldap"
  - "Linux"
  - "Security"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "A simple task of installing Manjaro on my office PC turned into a running battle that burned away the day. When connecting to the NFS share for my home dri"
---
A simple task of installing Manjaro on my office PC turned into a running battle that burned away the day.

When connecting to the NFS share for my home drive most things wen't well. The ones that didn't were crucial to using it for work. I found I couldn't use ssh as my `~/.ssh` folder had the wrong permissions. Looking at the files and folders they were all owned by `nobody:nogroup`.

I've come across this sort of issue before. Usually something is wrong with the LDAP and/or NFS config. I'd followed the [LDAP client setup](https://wiki.archlinux.org/index.php/LDAP_authentication#Client_Setup) and it was clearly working because I could login, both via ssh and gdm. It was mounting my home folder, but with the wrong permissions. LDAP must be right.

Now let's look at NFS. There's a bit of black magic or voodoo involved in NFS permissions. There has to be a mechanism that maps the logged on LDAP account uid/gid to the NFS file and folder permissions. Search long enough and you will get confused with should the `rpc.idmapd` service be running or not on both server and client? Well in my case that wasn't needed.

There is a file `/etc/idmapd.conf` that has settings for how lookups can be performed. I even enabled the `umich_ldap` translator and entered all the relevant LDAP config settings - again not necessary.

> \* Another option is to make sure the user and group IDs (UID and GID) match on both the client and server.
>
> \* Enabling/starting `nfs-idmapd.service` should not be needed as it has been replaced with a new id mapper:
>
> https://wiki.archlinux.org/index.php/NFS#Enabling_NFSv4_idmapping

My problem turned out to be a totally off the wall issue not related to NFS or LDAP or IDMAPD. I had built the host on a new drive with the idea of replacing the one in my current system. To do this I set the new system up as `desktop-11a` where my original system hostname is `desktop-11`. Then before I fit the drive I used `hostnamectl` to rename the new system to `desktop-11`. What I failed to do was change the host name inside `/etc/hosts`, it was still `desktop-11a`. The very instant I changed it to the correct name the NFS permissions were correct. No restart of any server or a reboot - it worked.

I had gone though all manner of changes in `idmapd.conf` for domain name, editted autofs configs so that I downgraded the NFS version to 3.0 and even 2.0. Restored the default `/etc/pam.d` folder. Many hours wasted over a trivial change.

If you're struggling with NFS permissions make sure all of your network config is correct, your `hostname`, `host` file and `resolv.conf` are right.

### /etc

#### nsswitch.conf

```
# Name Service Switch configuration file.
# See nsswitch.conf(5) for details.

passwd: files ldap mymachines systemd
group: files ldap [SUCCESS=merge] mymachines systemd
shadow: files ldap

publickey: files

hosts: files mymachines mdns4_minimal [NOTFOUND=return] resolve [!UNAVAIL=return] dns mdns4 myhostname
networks: files

protocols: files
services: files
ethers: files
rpc: files

netgroup: files
```

#### nslcd.conf

```
uid nslcd
gid nslcd
uri ldap://ldap/
base dc=domain,dc-tld
```

### /etc/pam.d

#### system-auth

```
auth       sufficient                  pam_ldap.so
auth       required                    pam_faillock.so      preauth
auth       [success=2 default=ignore]  pam_unix.so          try_first_pass nullok
-auth      [success=1 default=ignore]  pam_systemd_home.so
auth       [default=die]               pam_faillock.so      authfail
auth       optional                    pam_permit.so
auth       required                    pam_env.so
auth       required                    pam_faillock.so      authsucc
account    sufficient                  pam_ldap.so
-account   [success=1 default=ignore]  pam_systemd_home.so
account    required                    pam_unix.so
account    optional                    pam_permit.so
account    required                    pam_time.so
password   sufficient                  pam_ldap.so
-password  [success=1 default=ignore]  pam_systemd_home.so
password   required                    pam_unix.so          try_first_pass nullok shadow
password   optional                    pam_permit.so
session    required                    pam_limits.so
session    required                    pam_unix.so
session    optional                    pam_ldap.so
session    optional                    pam_permit.so
```

#### su and su-l

```
auth       sufficient  pam_rootok.so
auth            sufficient      pam_ldap.so
auth       required    pam_unix.so
account         sufficient      pam_ldap.so
account     required    pam_unix.so
session         sufficient      pam_ldap.so
session     required    pam_unix.so
```

We don't bother with the `pam_mkhomedir.so` as we mount those folders using [AutoFS](http://autofs) from NFS. Also we don't use `/etc/pam.d/passwd` as we have other mechanisms for user passwords.

## References

[https://wiki.archlinux.org/index.php/LDAP_authentication#Client_Setup](https://wiki.archlinux.org/index.php/LDAP_authentication#Client_Setup)

[https://wiki.archlinux.org/index.php/NFS#Enabling_NFSv4_idmapping](https://wiki.archlinux.org/index.php/NFS#Enabling_NFSv4_idmapping)
