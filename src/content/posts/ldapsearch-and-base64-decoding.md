---
pubDatetime: 2023-02-21T16:03:30Z
modDatetime: 2023-02-21T16:04:41Z
title: "ldapsearch and base64 decoding"
tags:
  - "Linux"
description: "I recently had to do an ldapsearch / ldbsearch that returned some base64 encoded results. $ sudo ldbsearch -H /var/lib/sss/db/cache_LDAP.ldb '(&(objectClas"
---
I recently had to do an `ldapsearch`/`ldbsearch` that returned some base64 encoded results.

```
$ sudo ldbsearch -H /var/lib/sss/db/cache_LDAP.ldb '(&(objectClass=sudoRule)(name=defaults))'
asq: Unable to register control with rootdse!
# record 1
dn: name=defaults,cn=sudorules,cn=custom,cn=LDAP,cn=sysdb
cn: defaults
dataExpireTimestamp: 1668693811
entryUSN: 20220825105355Z
name: defaults
objectCategory: sudoRole
objectCategory: top
objectClass: sudoRule
originalDN: cn=defaults,ou=SUDOers,dc=domain
sudoOption:: aW5zdWx0cwAA
sudoOption:: c3lzbG9nPXVzZXIAAA==
sudoOption: mailto=sysadmin@domain.tld
sudoOption:: aWdub3JlX2xvY2FsX3N1ZG9lcnMAAA==
sudoOption:: bWFpbHN1Yj1zdWRvIGFjY2VzcyByZXBvcnQgZnJvbSAlaAA=
sudoOption: pwfeedback
sudoOption: passprompt=[sudo-ldap] Password for %u on %H:
sudoOption: env_reset
distinguishedName: name=defaults,cn=sudorules,cn=custom,cn=LDAP,cn=sysdb

# returned 1 records
# 1 entries
# 0 referrals
```

I can go decode them using `base63 -d` line by line, but I found this magic spell that did it for me. I have no real clue how it works, it's written in Perl and that is a dark art to me.

```
$ sudo ldbsearch -H /var/lib/sss/db/cache_LDAP.ldb '(&(objectClass=sudoRule)(name=defaults))' | perl -MMIME::Base64 -MEncode=decode -n -00 -e 's/\n +//g;s/(?<=:: )(\S+)/decode("UTF-8",decode_base64($1))/eg;print'
asq: Unable to register control with rootdse!
# record 1
dn: name=defaults,cn=sudorules,cn=custom,cn=LDAP,cn=sysdb
cn: defaults
dataExpireTimestamp: 1668693811
entryUSN: 20220825105355Z
name: defaults
objectCategory: sudoRole
objectCategory: top
objectClass: sudoRule
originalDN: cn=defaults,ou=SUDOers,dc=domain
sudoOption:: insults
sudoOption:: syslog=user
sudoOption: mailto=sysadmin@domain.tld
sudoOption:: ignore_local_sudoers
sudoOption:: mailsub=sudo access report from %h
sudoOption: pwfeedback
sudoOption: passprompt=[sudo-ldap] Password for %u on %H:
sudoOption: env_reset
distinguishedName: name=defaults,cn=sudorules,cn=custom,cn=LDAP,cn=sysdb

# returned 1 records
# 1 entries
# 0 referrals
```

## References

[https://stackoverflow.com/a/38710484](https://stackoverflow.com/a/38710484)
