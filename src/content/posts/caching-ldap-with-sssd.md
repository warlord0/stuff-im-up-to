---
pubDatetime: 2021-06-14T16:08:07Z
modDatetime: 2021-06-14T16:13:56Z
title: "Caching LDAP with sssd"
tags:
  - "ldap"
  - "Linux"
description: "Most of the equipment we use is in house wired workstations with a few remote users on a BYOD type setup. What I wanted to try to bring in was a cached aut"
---
Most of the equipment we use is in house wired workstations with a few remote users on a BYOD type setup. What I wanted to try to bring in was a cached authentication method for our LDAP users to enable them to login to a corporate type device. This would have the benefit of using the same setup and authentication in the office as at home. No more local accounts logging in remotely as corp\[orate accounts.

sssd is the ticket for achieving this. I didn't thin it would provide much more difficulty over a standard LDAP setup, but I was wrong. There were plenty of things that went wrong and other things I should have anticipated.

Most useful was the document <https://wiki.archlinux.org/title/LDAP_authentication> it leads on into a section on how to configure online and offline access with sssd, and it's almost there.

I began testing logins and found errors in the journal complaining about TLS.

```
sssd_be[4230]: Could not start TLS encryption. unsupported extended operation
```

This didn't make sense, I'm not using TLS and had set the appropriate value `ldap_id_use_start_tls` to `false`. After some more reading, it turns out that the authentication process for LDAP under sssd **MUST** use TLS. This setting is only about using TLS for retrieving attributes. Because it MUST use TLS it failed because my server wasn't deployed with TLS. This meant I had to change my LDAP setup, so it was capable of using START_TLS.

Also, the parts I was missing was using a non-anonymous account to login and query the directory with. When logging in I was constantly being told my user wasn't being found. I double-checked the query using `ldapsearch` and got my account when I authenticated - which gave me the clue.

With the debug logging set so high (0xFFF0) after starting the sssd service and after attempting a login I saw this:

```
Jun 14 14:54:59 dev-999 sssd_be[11675]: Searching for users with base [dc=domain,dc=tld]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Searching 192.168.0.24:389
Jun 14 14:54:59 dev-999 sssd_be[11675]: calling ldap_search_ext with [(&(objectclass=posixAccount)(uid=*)(uidNumber=*)(gidNumber=*))][dc=domain,dc=tld].
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [objectClass]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [uid]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [userPassword]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [uidNumber]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [gidNumber]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [gecos]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [homeDirectory]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [loginShell]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [krbPrincipalName]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [cn]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [memberOf]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [modifyTimestamp]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [modifyTimestamp]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [shadowLastChange]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [shadowMin]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [shadowMax]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [shadowWarning]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [shadowInactive]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [shadowExpire]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [shadowFlag]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [krbLastPwdChange]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [krbPasswordExpiration]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [pwdAttribute]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [authorizedService]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [accountExpires]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [userAccountControl]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [nsAccountLock]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [host]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [rhost]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [loginDisabled]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [loginExpirationTime]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [loginAllowedTimeMap]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [sshPublicKey]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [userCertificate;binary]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Requesting attrs: [mail]
Jun 14 14:54:59 dev-999 sssd_be[11675]: ldap_search_ext called, msgid = 10
Jun 14 14:54:59 dev-999 sssd_be[11675]: New operation 10 timeout 60
Jun 14 14:54:59 dev-999 sssd_be[11675]: Trace: sh[0x55e4019669b0], connected[1], ops[0x55e401984e60], ldap[0x55e401953310]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Message type: [LDAP_RES_SEARCH_RESULT]
Jun 14 14:54:59 dev-999 sssd_be[11675]: Search result: No such object(32), no errmsg set
```

I could see nothing obvious with the query it was using, but it was returning "No such object". Yet when I ran the same query authenticated as the readonly user I did get results. Clearly I'm missing the authentication piece.

For this I had to trawl the net and came up with the helpful documentation:

[http://manpages.ubuntu.com/manpages/precise/man5/sssd-ldap.5.html](http://manpages.ubuntu.com/manpages/precise/man5/sssd-ldap.5.html)

Which lead me to the key `ldap_default_bind_dn`, but I didn't know how to add in the password. Then by reading the next two options, I was able to fill in the blanks. This is what my sssd.conf now looks like.

```
[sssd]
config_file_version = 2
services = nss, pam, sudo
domains = LDAP
debug_level = 0xFFF0


[domain/LDAP]
cache_credentials = true
enumerate = true

id_provider = ldap
auth_provider = ldap

ldap_uri = ldap://ldap
ldap_search_base = dc=domain,dc=tld
ldap_id_use_start_tls = true
ldap_tls_reqcert = never
ldap_tls_cacert = /etc/ssl/certs/ca-certificates.crt
chpass_provider = ldap
ldap_chpass_uri = ldap://ldap
entry_cache_timeout = 600
ldap_network_timeout = 2
ldap_sudo_search_base = ou=SUDOers,dc=domain,dc=tld
ldap_default_bind_dn = cn=readonly,dc=domain,dc=tld
ldap_default_authtok_type = password
ldap_default_authtok = SuperSecretKey

# OpenLDAP supports posixGroup, uncomment the following two lines
# to get group membership support (and comment the other conflicting parameters)
#ldap_schema = rfc2307
#ldap_group_member = memberUid

# Other LDAP servers may support this instead
ldap_schema = rfc2307bis
ldap_group_member = uniqueMember
```

> Now with my password in the config, a restart of the sssd service and I can now login!

Let's disconnect the network and try to login again, this should work as we're now cached, right? No, well it's logged in, but I got no GUI desktop. This is what I should have anticipated - the user can authenticate, but I now have no home folder as we use autofs to mount our NFS home folder to the users /home. Without a network connection I have ho /home folder and I have none of the common things I need from there, eg. `.ssh` keys and `.config`. If we're going to use sssd caching, I must disable the `/home` mount in my `auto.master` and allow the user to have a local filesystem /home.

## Troubleshooting

`sssctl` is your friend. You can use it to set debug level and check your config. When functional, you can also query the cache for users.

You certainly want to set the debug-level to everything (0xFFF0) as you test things out. You may also want to get debug logs
