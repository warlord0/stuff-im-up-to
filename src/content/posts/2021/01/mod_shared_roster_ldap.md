---
pubDatetime: 2021-01-21T18:28:42Z
modDatetime: 2021-01-22T13:05:57Z
title: "mod_shared_roster_ldap"
tags:
  - "ejabberd"
  - "Linux"
  - "xmpp"
heroImage: "/blog-media/2021/01/ejabberd1.png"
description: "Getting this shared roster from LDAP into my ejabberd config has been an absolute nightmare. Everything I find seems to be people asking the same question"
---
Getting this shared roster from LDAP into my ejabberd config has been an absolute nightmare. Everything I find seems to be people asking the same question or the comments made are for old versions. I struggled to find examples of a known good working example that used OpenLDAP and LDAP attributes for `groupOfUniqueNames`.

First, let me post a working example of my config, just so those that find this can see what works:

```
mod_shared_roster_ldap:
    ldap_groupattr: "cn"
    ldap_groupdesc: ""
    ldap_memberattr: "uid"
    ldap_memberattr_format: "%u"
    ldap_useruid: "uid"
    ldap_userdesc: "cn"
    ldap_rfilter: "(&(objectClass=groupOfUniqueNames)(cn=Staff))"
    ldap_gfilter: "(&(objectClass=person)(memberOf=cn=Staff,ou=Groups,dc=domain,dc=tld))"
    ldap_ufilter: "(&(objectClass=person)(uid=%u))"
    # ldap_filter: "" This is purposely commented out because it causes a fail to start
    ldap_auth_check: on
```

This didn't make much sense to me. The `ldap_memberattr` and `ldap_ufilter` seem somehow wrong. I was expecting filters using `uniqueMember` and having the parse it with `ldap_memberattr_format_re` to extract the `uid` from the `uniqueMember` attribute, but none of that is required.

It looks like there is only one shared roster in ejabberd. If only I realised that, I may have come to understand this quicker. What I'm looking at here is creating a roster from my Staff group and finding all users that have a `memberOf` attribute matching the Staff groups `dn`.

Pretty much if you're a `person` and in the group `Staff` you go on the shared roster. That's it.

> Initially I mistakenly thought that it would create a separate roster for each LDAP group it found. That's why every time I tried to build this configuration I was using `uniqueMember` and the `%g` substitution - it doesn't work this way - or if it does I nearly died trying.

## mod_vcard

It would be rude not to include the `mod_vcard` settings for LDAP. This version uses the `db_type: ldap` rather than the previous `mod_vcard_ldap`. The main changes here are for the full name which saw me replacing the default `displayName` with `cn`.

```
  mod_vcard:
    db_type: ldap
    search: true
    allow_return_all: true
    ldap_uids: {"uid": "%u"}
    ldap_search_fields:
      User: "%u"
      "Full Name": cn
      "Given Name": givenName
      "Middle Name": initials
      "Family Name": sn
      Nickname: "%u"
      Birthday: birthDay
      Country: c
      City: l
      Email: mail
      "Organization Name": o
      "Organization Unit": ou
    ldap_search_reported:
      "Full Name": FN
      "Given Name": FIRST
      "Middle Name": MIDDLE
      "Family Name": LAST
      "Nickname": NICKNAME
      "Birthday": BDAY
      "Country": CTRY
      "City": LOCALITY
      "Email": EMAIL
      "Organization Name": ORGNAME
      "Organization Unit": ORGUNIT
    ldap_vcard_map:
      NICKNAME: {"%u": []}
      FN: {"%s": [cn]}
      LAST: {"%s": [sn]}
      FIRST: {"%s": [givenName]}
      MIDDLE: {"%s": [initials]}
      ORGNAME: {"%s": [o]}
      ORGUNIT: {"%s": [ou]}
      CTRY: {"%s": [c]}
      LOCALITY: {"%s": [l]}
      STREET: {"%s": [street]}
      REGION: {"%s": [st]}
      PCODE: {"%s": [postalCode]}
      TITLE: {"%s": [title]}
      URL: {"%s": [labeleduri]}
      DESC: {"%s": [description]}
      TEL: {"%s": [telephoneNumber]}
      EMAIL: {"%s": [mail]}
      BDAY: {"%s": [birthDay]}
      ROLE: {"%s": [employeeType]}
      PHOTO: {"%s": [jpegPhoto]}
```

## References

Although this article itself is now date (the problem with spaces in the `cn` attribute seems fixed at least) and it it focused on Windows Active Directory, it still helped form the basis of the changes made to make it work with OpenLDAP.

[http://s.co.tt/2015/02/05/making-ejabberd-14-12-work-with-microsoft-windows-active-directory-ldap/](http://s.co.tt/2015/02/05/making-ejabberd-14-12-work-with-microsoft-windows-active-directory-ldap/)

[https://docs.ejabberd.im/admin/configuration/modules/#mod-roster](https://docs.ejabberd.im/admin/configuration/modules/#mod-roster)

[https://docs.ejabberd.im/admin/configuration/modules/#mod-vcard](https://docs.ejabberd.im/admin/configuration/modules/#mod-vcard)
