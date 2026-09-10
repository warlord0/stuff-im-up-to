---
pubDatetime: 2022-03-08T22:18:11Z
title: "OpenLDAP Hashes"
tags:
  - "ldap"
  - "Linux"
heroImage: "/blog-media/2020/06/openldap.png"
description: "Whilst doing some experimentation with OpenLDAP I found that if I hashed my passwords using SSHA-512 in Apache Directory Studio I would not be able to auth"
---
Whilst doing some experimentation with OpenLDAP I found that if I hashed my passwords using `SSHA-512` in Apache Directory Studio I would not be able to authenticate.

After some work I discovered that to support those hashes I needed to load the `pw-sha2.so` module.

We're using the [osixia](https://github.com/osixia/docker-openldap-backup) docker container for our LDAP. It's a very simple container and has some nice features like daily backups, and is built around olc (OnLine Configuration).

Looking inside the container, I find the module I want is included in `/usr/lib/ldap/pw-sha2.so` along with all the other required parts. This means I just need to add it to the olc config to load the module. To do this, entered the container and I created an LDIF file with the following content:

```
docker-compose exec openldap bash
```

#### pw-sha2.ldif

```
dn: cn=module{0},cn=config
changetype: modify
add: olcModuleLoad
olcModuleLoad: pw-sha2.la
```

Then imported it using:

```
ldapmodify -Q -Y EXTERNAL -H ldapi:/// -f pw-sha2.ldif
```

That's all it takes. Now I can use the `SSHA-256` and `SSHA-512` hashes.
