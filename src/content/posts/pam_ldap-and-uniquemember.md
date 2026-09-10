---
pubDatetime: 2020-05-24T09:55:56Z
modDatetime: 2020-05-24T10:20:18Z
title: "PAM_LDAP and uniqueMember"
tags:
  - "ldap"
  - "Linux"
  - "pam"
  - "ssh"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "After upgrading the LDAP server so we could make use of some new features like olc and in particular memberOf I ran into a major issue. Where many programs"
---
After upgrading the LDAP server so we could make use of some new features like olc and in particular `memberOf` I ran into a major issue.

Where many programs requiring `memberOf` work just great, Linux `id` fails to show anything but the primary group membership from the `gid` attribute.

I discovered the problem when trying to make use of `AllowGroups` in `sshd_config`. It didn't matter what group I chose for the filter I always got denied and saw in the log:

```
User <user_name> not allowed because none of user's groups are listed in AllowGroups
```

Checking the membership and querying with `ldapsearch` shows I had the required memberships - `access-service-ssh`.

```
$ ldapsearch -x -D "cn=readonly,dc=domain" -H "ldap://ldapserver.domain" -b "dc=domain" -W "(&(objectClass=posixAccount)(uid=myuser))" -o ldif-wrap=no memberOf

# extended LDIF
#
# LDAPv3
# base <dc=domain> with scope subtree
# filter: (&(objectClass=posixAccount)(uid=myuser))
# requesting: memberOf 
#

# myuser, people, domain
dn: uid=myuser,ou=people,dc=domain
memberOf: cn=access-role-sysadmin,ou=groups,dc=domain
memberOf: cn=access-role-people,ou=groups,dc=domain
memberOf: cn=access-service-ssh,ou=groups,dc=domain

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```

But when I used `id myuser` all I got was:

```
uid=1003(myuser) gid=501(access-role-people) groups=501(access-role-people)
```

I then checked the log on the LDAP server and saw the problem:

```
conn=1142 op=3 SRCH base="dc=domain" scope=2 deref=0 filter="(&(objectClass=posixGroup)(|(memberUid=myuser)(member=uid=myuser,ou=people,dc=domain)))"
```

The `id` call is only querying for `memberUid` and `member` and not using `uniqueMember` as we needed.

Trawling the net I found few useful posts and articles. Many relating to Active Directory and mapping attributes, but nothing useful.

I did discover an entry in `pam_ldap.conf` that made me think I was onto something:

```
pam_member_attribute uniquemember
```

But the same LDAP query was sent and nothing referenced `uniqueMember`.

The only way I could get this to work was to repeat the group membership adding the `memberUid` attribute and putting in the users RDN, eg. `myuser`. Then the call to `id` would at least get the correct memberships. I does mean a duplicate entry and goes against everything DRY - "Don't Repeat Yourself".

I couldn't let this lie so went to dig deeper. I discovered source code for `nss-pam-ldapd` on [Github](https://github.com/arthurdejong/nss-pam-ldapd) and thought I'd have a nosey around. It didn't take long until I came across the nature of my problem - "[switch to using the member attribute by default instead of uniqueMember](https://github.com/arthurdejong/nss-pam-ldapd/commit/d76bfc4731e425096679ce248f559de14f75a6bd)" - a specific change that removes `uniqueMember` in favour of `member`!

Now I just needed to figure out how to reverse that change for my systems. Looking at the man page for `nslcd.conf` - [https://arthurdejong.org/nss-pam-ldapd/nslcd.conf.5](https://arthurdejong.org/nss-pam-ldapd/nslcd.conf.5), shows I can use mappings. I added the following into my config, and restarted the nslcd service:

```
map group member uniqueMember
```

Now my call to `id` works as I need it! I get back the proper groups.

```
uid=1003(myuser) gid=501(access-role-people) groups=501(access-role-people),500(access-role-sysadmin),507(access-service-ssh)
```

I can also see the LDAP query on the LDAP server is now correct:

```
conn=1145 op=6 SRCH base="dc=domain" scope=2 deref=0 filter="(&(objectClass=posixGroup)(|(memberUid=myuser)(uniqueMember=uid=myuser,ou=people,dc=domain)))"
```

> One thing I did find was that I had no need for nscd. In fact this had cached the bad responses I already had so that I found I got the correct response by removing it.

I burned many, many hours on this. I hope someone else finds this before chasing the same solution.
