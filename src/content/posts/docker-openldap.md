---
pubDatetime: 2020-02-15T15:29:09Z
title: "Docker OpenLDAP"
tags:
  - "Docker"
  - "ldap"
  - "Linux"
description: "The LDAP instance in our environment is pretty ancient and has served well for many, many years. But there's one key feature we'd like to see added to our"
---
The LDAP instance in our environment is pretty ancient and has served well for many, many years. But there's one key feature we'd like to see added to our schema - memberOf.

The current group membership is based on memberUID and is a bit clunky by modern standards. Time to upgrade.

This time we're going to run it in a container. Making it more mobile and resilient. The image we chose [`osixia/openldap`](https://github.com/osixia/docker-openldap) has a lot of pulls and looks a good candidate to use.

Separately both a colleague and I set about building a service and both reached the same point at the same time and each couldn't see the `memberOf` attribute on our instances, but for different reasons.

My problem was pretty simple. It turns out that Apache Directory Studio does not support showing the `memberOf` attribute! Apparently this is reported to be coming in version 2.1... but that was a post from 2013.

When I built my OU's, groups (`goupOfUniqueNames`) and users I assigned membership attributes within the group using `uniqueMember` my `memberOf` attributes for the users appeared as expected against the user when I carried out an LDAP query using `ldapsearch` or `slapcat`.

This didn't go so well for my friend. He had no `memberOf` attributes. Try as we might his instance would not build with the `memberOf` module - whereas mine worked seamlessly.

We repulled his image which was `:1.3.0` and made it match the one I was using `:latest`. Restarted and still no `memberOf`! We burned a lot of time trying to resolve the issue.

Going into the container using bash we could see that the memberof module just wasn't there!

```
# slapcat -n 0 | grep olcModuleLoad
olcModuleLoad: {0}back_mdb
```

What we expected to see:

```
# slapcat -n 0 | grep olcModuleLoad
olcModuleLoad: {0}back_mdb
olcModuleLoad: {1}memberof
olcModuleLoad: {2}refint
```

Yet on mine it clearly was. Did we have to manually install memberof using `ldapadd`/`ldapmodify` and feed them `.ldif` files? Why does it work for me and not him? We compared the docker-compose files and couldn't understand where the difference was.

```
version: '3'

services:
  slapd:
    image: osixia/openldap:latest
    environment:
      LDAP_ADMIN_PASSWORD: "mostsecretkey"
      LDAP_CONFIG_PASSWORD: "supersecretkey"
      LDAP_DOMAIN: domain
      LDAP_BASE_DN: dc=domain
      LDAP_ORGANISATION: "Widgets"
      LDAP_READONLY_USER: "true"
      LDAP_READONLY_USER_PASSWORD: "mysecretkey"
      LDAP_TLS_VERIFY_CLIENT: try
    volumes:
      - "./var/lib/ldap/:/var/lib/ldap"
      - "./etc/ldap/slapd.d/:/etc/ldap/slapd.d"
    ports:
      - "389:389"
      - "636:636"
```

The only difference between his file and mine was `LDAP_BASE_DN: domain`. By leaving out the `dc=` which he thought was implied it prevented the modules from being added! Such a simple change, but what a strange impact.
