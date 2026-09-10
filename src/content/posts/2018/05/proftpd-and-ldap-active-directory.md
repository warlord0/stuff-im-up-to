---
pubDatetime: 2018-05-10T17:01:51Z
modDatetime: 2018-05-11T09:38:06Z
title: "Proftpd and LDAP / Active Directory"
tags:
  - "active directory"
  - "debian"
  - "ftp"
  - "ldap"
  - "Linux"
  - "Windows"
heroImage: "/blog-media/2018/05/proftpd.png"
description: "We've had a vsftpd server for a while and it's performed very well for us. But it would appear that it's not actively maintained. This may not be a problem"
---
We've had a vsftpd server for a while and it's performed very well for us. But it would appear that it's not actively maintained. This may not be a problem as it still currently works just fine and we don't have any obvious vulnerabilities with it, but as the OS it's running on is Wheezy we need to move on at least up to Stretch. So I figured I'd try deploying a new server but configured with proftpd. As I'm planning on using LDAP / Active Directory for the user authentication I need to install the proftpd module `mod_ldap`. On my bare system I installed the module and it drags the dependencies down to include with the install the server program itself (`proftpd-basic`) too.

    $ sudo apt-get install proftpd-mod-auth

By default the install already comes with PAM support. So after it finished installing I pretty much connected to FTP as a "non-root" user and was able to connect to my home folder and then navigate the entire file system. Now we know it works it's time to start locking things down to the way we want it to operate.

## Configuring LDAP

The config files are under `/etc/proftpd`, so editing the main `proftpd.conf` seemed logical. I uncommented the include for LDAP:

    Include /etc/proftpd/ldap.conf

Then edited the included `ldap.conf` file to provide my server address, bindings and assigned the Active Directory attributes to the corresponding \*nix attributes:

    LDAPUseTLS on
    LDAPServer ldap://ldap.domain.local/??sub
    LDAPBindDN "cn=Read Only User,cn=Users,dc=domain,dc=local" "secret"
    LDAPUsers "ou=FTP Users,dc=domain,dc=local" (&(objectClass=user)(sAMAccountName=%u)) (&(objectClass=user)(uid=%v))
    LDAPLog /var/log/mod_ldap.log
    LDAPDefaultGID 100 # users group
    LDAPForceDefaultGid on
    LDAPAttr uid sAMAccountName
    LDAPAttr homeDirectory unixHomeDirectory

> If you're using `LDAPUseTLS on` make sure you have imported your the CA certificate used to sign your LDAP/AD server into your [trusted CA list](https://warlord0blog.wordpress.com/2016/09/22/trusting-ca-certificates/).

I don't want all our domain users to be able to use this so we have an separate OU that contains only the parties we want to use the FTP site. But using LDAP/AD like this means that our support staff need no knowledge of Linux to handle calls from FTP users about password resets etc. Thinking this was all I needed to do to activate LDAP I tried to connect with a known AD user and password without success. Doing some debugging by running proftpd as a non-daemon process showed no activity relating to LDAP.

    $ sudo proftpd -nd10

Looks like even though I installed the module and configured it, I must activate it in `modules.conf` by uncommenting the `LoadModule` entry.

    # Install proftpd-mod-ldap to use this
    LoadModule mod_ldap.c

Because I added the option `LDAPLog` in `ldap.conf` above I can see LDAP now working its magic. But I've still to fix problems in my config to allow these LDAP users to have access to their home folders. We're at a point at which you can say you can successfully authenticate with LDAP. Now we need to make sure the underlying OS can handle users and groups from the external LDAP servers. We need to do this or the LDAP users can't be assigned permissions/ACL's on the Linux filesystem. So you must install and configure NSS and LDAP using `nslcd`.

    $ sudo apt-get install nslcd

### /etc/nsswitch.conf

    passwd: compat ldap
    group: compat ldap
    shadow: compat ldap
    gshadow: files

    hosts: files dns ldap
    networks: files

    protocols: db files
    services: db files
    ethers: db files
    rpc: db files

    netgroup: nis
    aliases: ldap

### /etc/nslcd.conf (relevant changes only)

The `nslcd.conf` pretty much takes the options used in the `ldap.conf` so that both use the same LDAP credentials and settings.  

    # The location at which the LDAP server(s) should be reachable.
    uri ldap://ldap.domain.local/

    # The search base that will be used for all queries.
    base ou=FTP Users,dc=domain,dc=local

    # The LDAP protocol version to use.
    ldap_version 3

    # The DN to bind with for normal lookups.
    binddn cn=Read Only User,cn=Users,dc=domain,dc=local
    bindpw secret

    # SSL options
    ssl start_tls
    tls_reqcert allow
    tls_cacertfile /etc/ssl/certs/ca-certificates.crt
    tls_ciphers HIGH

    pagesize 1000
    referrals off

    filter passwd (&(objectClass=user)(uidNumber=*)(unixHomeDirectory=*))
    map passwd uid sAMAccountName
    map passwd homeDirectory unixHomeDirectory
    map passwd gecos displayName
    map passwd gidNumber "100"

    filter shadow (&(objectClass=user)(uidNumber=*)(unixHomeDirectory=*))
    map shadow uid sAMAccountName
    map shadow shadowLastChange pwdLastSet

    filter group (&(objectClass=group)(gidNumber=*))

    log syslog debug

After a reboot you should be able to query your users from LDAP using `getent` and `id`.

    $ getent passwd
    ...
    ftpuser1:*:1012:100:ftpuser1:/home/vftp/ftpuser1:/bin/false
    ftpuser2:*:1013:100:ftpuser2:/home/vftp/ftpuser2:/bin/false
    ftpuser3:*:1014:100:ftpuser3:/home/vftp/ftpuser3:/bin/false
    ftpuser4:*:1015:100:ftpuser4:/home/vftp/ftpuser4:/bin/false

    $ id ftpuser4
    uid=1015(ftpuser4) gid=100(users) groups=100(users)

My settings for mappings above relate to our Active Directory setup. We have added in unix attributes so we can add extended properties like `uidNumber` and `unixHomeDirectory` to handle our needs. You may need to modify your mappings to suit yours.

## Locking the Users to their Home Folders

A simple change in the `proftpd.conf` file chroot's the user to their home folder

    DefaultRoot ~

But I also wanted to create a skeleton structure and set permissions on the folder. I like to have simple `in` and `out` folders and only allow the users to put files into these. So I created the `in` and `out` folders under a skeleton structure under `/etc/ftpd/skel` and set the permissions I wanted on the `in` and `out` folders.

    $ sudo mkdir -p /etc/ftpd/skel/{in,out}
    $ sudo chgrp users /etc/ftpd/skel/{in,out}
    $ sudo chmod 770 /etc/ftpd/skel/{in,out}

Then back to my `proftpd.conf` I added:

    CreateHome on 550 dirmode 750 skel /etc/ftpd/skel

This makes the created home folder read only at the top level (550). It also copies files/folders from the skeleton folder to give them the `in` and `out` paths by default.

## TCP Wrapper

Protecting the proftpd daemon further can be done by adding TCP Wrapper support to allow or deny hosts based on source IP Address.  The module `mod_wrap` is active by default, but not configured. You can configure it by adding the config into the main proftpd config, but I chose to add it into a `conf.d/mod_wrap.conf` file instead.

     <IfModule mod_wrap.c>
       TCPAccessFiles /etc/hosts.allow /etc/hosts.deny
       TCPAccessSyslogLevels info warn
     </IfModule>

This then uses the servers hosts.allow and hosts.deny files to prevent access based on those standard rules. But you could also use a user specific `~/.hosts.allow` if you want more granular user and IP control. in my `hosts.allow` I just put in the daemon name followed by the IP's I allow:

    proftpd: 192.168.1.

and in `hosts.deny` I block all IP's.

    proftpd: ALL

I also ensure that I'm not solely reliant on the TCP wrapper by having firewall rules to support this, but we use a belt and braces approach.
