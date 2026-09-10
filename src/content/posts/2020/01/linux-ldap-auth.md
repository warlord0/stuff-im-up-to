---
pubDatetime: 2020-01-16T14:41:00Z
modDatetime: 2023-04-21T17:51:21Z
title: "Linux LDAP Auth"
tags:
  - "ldap"
  - "Linux"
  - "Security"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "Up until now all of my Linux authentication has been local file based auth. I've added LDAP to services and applications, but logging into a Linux box has"
---
Up until now all of my Linux authentication has been local file based auth. I've added LDAP to services and applications, but logging into a Linux box has always had local users.

Following a process to install LDAP as the pam authenticator for Debian Buster included the following steps.

```
$ sudo apt install libnss-ldapd libpam-ldap ldap-utils
```

Then provide the details meeting your LDAP needs. Such as:

> LDAP URI: ldap://ldap.domain.tld/\
> Search Base: dc=domain,dc=tld\
> DN and password of the Admin account if required: cn=admin,ou=People,dc=domain,dc=tld

Now you need to modify some configuration files.

Edit `/etc/nsswitch.conf` to add in references to ldap, we're also going to use it for sudo and have added that into the config.

#### /etc/nsswitch.conf

```
passwd: compat ldap
group: compat ldap
shadow: compat ldap
...
sudoers: files ldap
```

#### /etc/pam.d/common-password

Remove `use_authok` from any line in the file `common-password`.

#### /etc/pam.d/common-session

Add the following line:

```
session optional pam_mkhomedir.so skel=/etc/skel umask077
```

For good measure restart `nscd` after making any changes to the above files.

```
$ sudo systemctl restart nscd
```

References: [https://www.server-world.info/en/note?os=Debian_10&p=openldap&f=3](https://www.server-world.info/en/note?os=Debian_10&p=openldap&f=3)
