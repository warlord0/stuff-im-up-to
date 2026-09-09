---
pubDatetime: 2020-01-15T13:18:12Z
modDatetime: 2022-11-03T09:12:53Z
title: "polkit-agent-helper-1[6160]"
tags:
  - "gnome"
  - "Linux"
description: "After setting up LDAP authentication on my machine, things went as expected, and I was able to authenticate at the GDM login and sudo from the command line"
---
After setting up LDAP authentication on my machine, things went as expected, and I was able to authenticate at the GDM login and sudo from the command line etc. But when I called up a program that required elevated privileges in Gnome the authentication always failed, regardless of the password I used, and the dialog looked strange because it didn't list the username it wanted the credentials for.

In particular, when I opened software packages or timeshift I'd get the authentication dialog, and it would fail.

Using `journalctl -f` and tailing `/var/log/auth.log` helped me figure out what was going on.

```
Jan 15 12:41:14 desktop-11 polkit-agent-helper-1[7398]: Jan 15 12:41:14 desktop-11 polkit-agent-helper-1[7398]: pam_unix(polkit-1:auth): authentication failure; logname= uid=1103 euid=0 tty= ruser=someonestrange rhost= user=someonestrange
Jan 15 12:41:14 desktop-11 polkit-agent-helper-1[7398]: pam_ldap: error trying to bind as user "uid=someonestrange,ou=People,dc=domain" (Invalid credentials)
```

The user it was trying to authenticate as happens to be the first user on our LDAP schema.

Googling around for polkit and how it works, I found that the users that can authenticate are held in the config file `/etc/polkit-1/localauthority.conf.d/51-debian-sudo.conf`

```
[Configuration]
AdminIdentities=unix-group:sudo
```

Which seems obvious enough, but now we're using LDAP and `sudo-ldap` it's trying to use members of a local group called `sudo`. As this has only one member - the first user used to install the local Debian system with, it selected that user. The selected users ID of 1000 was then used by polkit, but the auth process went and used user ID 1000 on LDAP - which is our `someonestrange`.

At least now I know what's going on. I could probably fix it by investigating how polkit works and seeing if I could set it to use an LDAP group, but the quickest fix was just to add my LDAP user account to the local `sudo` group, and then I could authenticate in Gnome.

```
$ sudo gpasswd -a myuser sudo
```
