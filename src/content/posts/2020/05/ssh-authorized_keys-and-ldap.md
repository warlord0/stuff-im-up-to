---
pubDatetime: 2020-05-16T14:47:00Z
modDatetime: 2020-05-15T19:08:58Z
title: "SSH Authorized_Keys and LDAP"
tags:
  - "ldap"
  - "Linux"
  - "ssh"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "Traditionally we store public keys in ~/.ssh/authorized_keys , but this means pushing them around all the servers we want to connect to. Instead of doing t"
---
Traditionally we store public keys in `~/.ssh/authorized_keys`, but this means pushing them around all the servers we want to connect to. Instead of doing that let's put them onto our LDAP server and store them once.

## Modify Your LDAP Schema

First we need to modify our LDAP schema so that it has the required storage for `sshPublicKeys`.

Create an .`ldif` file called `openssh-lpk.ldif` and paste in the following:

```
dn: cn=openssh-lpk,cn=schema,cn=config
objectClass: olcSchemaConfig
cn: openssh-lpk
olcAttributeTypes: ( 1.3.6.1.4.1.24552.500.1.1.1.13 NAME 'sshPublicKey'
    DESC 'MANDATORY: OpenSSH Public key'
    EQUALITY octetStringMatch
    SYNTAX 1.3.6.1.4.1.1466.115.121.1.40 )
olcObjectClasses: ( 1.3.6.1.4.1.24552.500.1.1.2.0 NAME 'ldapPublicKey' SUP top AUXILIARY
    DESC 'MANDATORY: OpenSSH LPK objectclass'
    MAY ( sshPublicKey $ uid )
    )
```

Then import it into your LDAP config using:

```
ldapadd -Y EXTERNAL -h ldapi:/// -f openssh-lpk.ldif
```

For each user you should add an `objectClass` of `ldapPublicKey` and then you can go and create attribute(s) for `sshPublicKey` and paste your current `authorised_keys` in. You can have more than one `sshPublicKey` attribute, or have many entries in one attribute. If you paste multiple entries into a single key they will become base64 encoded - just bear that in mind as you'll need to process that later.

## Create a Script to Extract a Users Keys

Modify the following script to suit and put it into `/usr/local/bin` making it executable.

You will need to ensure that the variables `URI`, `BASE`, `BINDDN` and `BINDPW` are populated in your `/etc/ldap/ldap.conf`.

#### ldap-ssh-publickey.sh

```
#!/bin/bash

# Find sshPublicKey for the given user and process 
# each entry into an authorized_keys format

if [ -z "$1" ]; then
  echo "No user id specified"
  exit 1;
fi

# Read variables from ldap.conf
CONF=/etc/ldap/ldap.conf

if [ -e "$CONF" ]; then
  while read -r var val; do
    export "$var"="$val"
  done <<< $(grep "^[^#]" $CONF)
fi

# Search LDAP and return the lines with no-wrap
ldapsearch -x -D ${BINDDN} -w ${BINDPW} -H ${URI} \
  -b ${BASE} "(&(objectClass=posixAccount)(uid=$1))" \
  -o ldif-wrap=no sshPublicKey | while read -r line; do
  # Double :: returns are multiline base64 encoded
  if [[ "$line" = sshPublicKey::* ]]; then
    echo "$line" | sed 's/sshPublicKey:: //' | base64 -d
  # Single : are direct public keys
  elif [[ "$line" = sshPublicKey:* ]]; then
    echo "$line" | sed 's/sshPublicKey: //'
  fi
done
```

```
chmod +x /usr/local/bin/ldap-ssh-publickey.sh
```

You can test the script from the command line:

```
/usr/local/bin/ldap-ssh-publickey.sh myuser
```

## Edit /etc/ssh/sshd_config

Add the following entries into `sshd_config`.

```
AuthorizedKeysCommand /usr/local/bin/ldap-ssh-publickey.sh
AuthorizedKeysCommandUser nobody
```

Restart `sshd`.

```
sudo systemctl restart sshd
```

Sshd will now use either the LDAP of file version of the public keys. If you want to disable the use of `~/.ssh/authorized_keys` files altogether add the following into `sshd_config` and restart.

```
AuthorizedKeysFile none
```

> If you do this then none of your non-LDAP users will be able to use public keys.
