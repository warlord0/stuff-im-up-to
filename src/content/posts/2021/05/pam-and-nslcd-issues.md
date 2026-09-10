---
pubDatetime: 2021-05-07T14:31:20Z
title: "PAM and NSLCD Issues"
tags:
  - "Linux"
  - "manjaro"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "My office PC is setup to authenticate against our LDAP server and is configured using the Arch guidance here: https://wiki.archlinux.org/title/LDAP_authent"
---
My office PC is setup to authenticate against our LDAP server and is configured using the Arch guidance here: [https://wiki.archlinux.org/title/LDAP_authentication](https://wiki.archlinux.org/title/LDAP_authentication)

I managed to miss one important step with was the sudoers entry in `nsswitch.conf` and after adding it this things went wrong in some special ways. I can't be certain that this caused the issues, but all of a sudden I couldn't sudo - obviously related.

Chasing the error I found I needed to update `/etc/openldap/ldap.conf` with the details for my LDAP service and specify the sudoers base uri.

```
URI        ldap://ldap-01
BASE        dc=domain,dc=tld
SUDOERS_BASE    ou=SUDOers,dc=domain,dc=tld
```

Success I could then use sudo, but then found I couldn't use the Manjaro package manager as it would not authenticate me. This had been working since I build the system. I can use sudo `pacman` but cannot use the Gnome package manager.

Looking at `journalctl` there was a strange problem.

```
polkit-agent-helper-1[42384]: pam_unix(polkit-1:auth): authentication failure; logname= uid=1103 euid=0 tty= ruser=forename.surname rhost=  user=forename.surname
nslcd[512]: [0a6d21] <passwd="pam_unix_non_existent:"> request denied by validnames option
```

This rang a bell with me as I recall not being able to create a local user on Manjaro with a "." in the name. Why this should have snuck in to bite me now I have no clue. I tracked it into `/etc/nslcd.conf` and added an entry that allows for any name format using a regex:

```
validnames /.*/i
```

Probably wider than I should, but it will suffice.

This wasn't the end of the issue. Now I find myself with entries like:

```
polkit-agent-helper-1[29761]: pam_ldap(polkit-1:auth): authentication succeeded


gnome-shell[29761]: polkit-agent-helper-1: pam_authenticate failed: Authentication failure

polkit-agent-helper-1[29761]: PAM 1 more authentication failure; logname= uid=1103 euid=0 tty= ruser=forename.surname rhost=  user=forename.surname

polkitd[475]: Operator of unix-session:3 FAILED to authenticate to gain authorization for action org.manjaro.pamac.commit for system-bus-name::1.156 [pamac-manager --updates] (owned by...
```

I was forced to reread the LDAP guidance and trawl many other pages before this jumped out at me:

> The basic rule of thumb for PAM configuration is to include `pam_ldap.so` wherever `pam_unix.so` is included.
>
> [https://wiki.archlinux.org/title/LDAP_authentication#PAM_Configuration](https://wiki.archlinux.org/title/LDAP_authentication#PAM_Configuration)

Looking in `/etc/pam.d` I find a file `polkit-1` and check the content.

```
#%PAM-1.0

auth required pam_env.so
auth sufficient pam_fprintd.so
auth sufficient pam_unix.so try_first_pass likeauth nullok
auth required pam_deny.so
auth       include      system-auth
account    include      system-auth
password   include      system-auth
session    include      system-auth
```

Let's add in the `pam_ldap.so` entry:

```
#%PAM-1.0

auth required pam_env.so
auth sufficient pam_fprintd.so
auth sufficient pam_ldap.so
auth sufficient pam_unix.so try_first_pass likeauth nullok
auth required pam_deny.so
auth       include      system-auth
account    include      system-auth
password   include      system-auth
session    include      system-auth
```

Take a trip back to the package manager and presto I can now update and install packages again.
