---
pubDatetime: 2023-03-09T17:59:30Z
modDatetime: 2023-03-09T18:07:33Z
title: "SSSD and SUDOers"
tags:
  - "authentication"
  - "ldap"
  - "Linux"
  - "sssd"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "All our remote users are using LDAP cached credentials using SSSD. This works really well for users that transition online to offline, with one failing. Wh"
---
All our remote users are using LDAP cached credentials using SSSD. This works really well for users that transition online to offline, with one failing. When they attempt to use `sudo` to elevate permissions to carry out a privileged operation.

For the longest time I could not get this working.

I searched LDAP and compared results with the offline cache.

```
$ ldapsearch -x -ZZ -H "ldap://ldap:389"  -D "cn=admin,dc=domain,dc=tld" -w SuperSecretKey -b "ou=SUDOers,dc=domain,dc=tld" '(&(objectClass=sudoRole)(cn=defaults))'     

$ sudo ldbsearch -H /var/lib/sss/db/cache_LDAP.ldb '(&(objectClass=sudoRule)(cn=defaults))'
```

It all seemed to match. What I didn't spot was that many of the results came back as base64 encoded. I didn't see this as an issue, as it all worked with `sudo-ldap`. If I decoded the strings, they looked fine.

```
sudoOption:: aW5zdWx0cwAA
```

Which decoded is:

```
sudoOption: insults
```

The bit I was missing is that whilst it decoded a string, the thing I could not see on the end was NULL characters! These did not affect `sudo-ldap`, but appears to cause mayhem with `sss`.

To fix this, I exported the LDAP SUDOers branch to an LDIF file. I used a bit of magic from [ldapsearch and base64 decoding](/posts/ldapsearch-and-base64-decoding/) to help get the correct decoding, and then replaced all the base64 encoded strings with plain text strings in the LDIF file. Import the LDIF back into my LDAP to overwrite all the settings, and now I see clean plain text entries returned by my `ldapsearch`. A little while later, change my `nsswitch.conf` entries from `ldap` to `sss`, a reboot and cache update. Now I can use `sudo` and it works.

I have no clue how null characters got into our LDAP. But it has gone through a number of iterations in its lifetime.
