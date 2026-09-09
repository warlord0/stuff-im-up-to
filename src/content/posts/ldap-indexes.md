---
pubDatetime: 2020-10-19T07:49:07Z
title: "LDAP Indexes"
tags:
  - "ldap"
  - "Linux"
description: "On the OpenLDAP server I see a lot of entries in the log file about uidNumber not being indexed. If this is the case I should add an index to try to help w"
---
On the OpenLDAP server I see a lot of entries in the log file about `uidNumber` not being indexed. If this is the case I should add an index to try to help with that.

First get a list of the current indexes.

```
# /usr/sbin/slapcat -n 0 | grep olcDbIndex
olcDbIndex: uid eq
olcDbIndex: mail eq
olcDbIndex: memberOf eq
olcDbIndex: entryCSN eq
olcDbIndex: entryUUID eq
olcDbIndex: objectClass eq
```

Add these onto the end of a new `ldif` file `index.ldif` and add on the new line `olcDbIndex: uidNumber` (or your equivalent missing index). So that looks like this:

```
dn: olcDatabase={1}mdb,cn=config
changetype: modify
replace: olcDbIndex
olcDbIndex: uid eq
olcDbIndex: mail eq
olcDbIndex: memberOf eq
olcDbIndex: entryCSN eq
olcDbIndex: entryUUID eq
olcDbIndex: objectClass eq
oldDbIndex: uidNumber eq
```

Import and execute the ldif using `ldapmodify`:

```
ldapmodify -Q -Y EXTERNAL -H ldapi:// -f index.ldif
```

You may need to log on using a different method, this is used to run `ldapmodify` and authenticate locally on the LDAP server as it uses the `ldapi` interface.
