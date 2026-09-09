---
pubDatetime: 2020-01-20T19:01:00Z
modDatetime: 2020-02-24T11:41:29Z
title: "Saltstack and Debconf"
tags:
  - "Linux"
  - "saltstack"
description: "You can get Saltstack to manipulate package deployments using debconf. What you'll need is to know the questions that debconf has about a package so you ca"
---
You can get Saltstack to manipulate package deployments using debconf. What you'll need is to know the questions that debconf has about a package so you can provide the answers.

For example, installing libpam-ldap requires a number of answers to configure the service. My state file (`.sls`) contains something like this:

```
debconf-utils:
  pkg.installed

libpam-ldap:
  debconf.set:
    - data:
      'libpam-ldap/binddn': {'type': 'string', 'value': 'cn=admin,dc=domain,dc=tld'}
      'libpam-ldap/dblogin': {'type': 'boolean', 'value': False}
      'libpam-ldap/dbrootlogin': {'type': 'boolean', 'value': False}
      'libpam-ldap/override': {'type': 'boolean', 'value': True}
      'libpam-ldap/pam_password': {'type': 'string', 'value': 'crypt'}
      'shared/ldapns/base-dn': {'type': 'string', 'value': 'dc=domain,dc=tld'}
      'shared/ldapns/ldap-server': {'type': 'string', 'value': 'ldap://ldap/'}
      'shared/ldapns/ldap_version': {'type': 'string', 'value': '3'}
```

Which sets out that the package to be installed in this example, and configured is `libpam-ldap`. The questions listed have the answers applied in the format `'question': {answer}`.

To get a list of the questions you can use `debconf-show [package]` eg.

```
$ sudo debconf-show libpam-ldap
* libpam-ldap/rootbindpw: (password omitted)
* libpam-ldap/bindpw: (password omitted)
* libpam-ldap/override: true
* shared/ldapns/base-dn: dc=domain,dc=tld
* libpam-ldap/pam_password: crypt
* libpam-ldap/dblogin: false
* libpam-ldap/rootbinddn: cn=admin,dc=domain,dc=tld
* libpam-ldap/dbrootlogin: false
* libpam-ldap/binddn: cn=admin,dc=domain,dc=tld
* shared/ldapns/ldap_version: 3
* shared/ldapns/ldap-server: ldap://ldap
```
