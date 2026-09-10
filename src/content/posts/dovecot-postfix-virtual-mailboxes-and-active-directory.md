---
pubDatetime: 2015-09-03T17:32:24Z
modDatetime: 2016-09-19T17:33:56Z
title: "Dovecot, Postfix, Virtual Mailboxes and Active Directory"
tags:
  - "active directory"
  - "dovecot"
  - "ldap"
  - "Linux"
  - "postfix"
heroImage: "/blog-media/2016/09/debian-logo-1.png"
description: "Well turns out that setting this up isn't really as straight forward as simply treating Active Directory like LDAP. The main reason seems to be the way you need to authenticate and the limitations of doing any kind of user lookup whilst using auth_bind = yes, just doesn't seem possible."
---
Well turns out that setting this up isn't really as straight forward as simply treating Active Directory like LDAP. The main reason seems to be the way you need to authenticate and the limitations of doing any kind of user lookup whilst using auth_bind = yes, just doesn't seem possible. In order to resolve this is you have to live with having Dovecot use a static userdb table that returns the gid, uid and home - but then when you try to sort Postfix so that it delivers using Dovecot it fails because it cant use a static userdb to work out if the user account/mailbox exists or not. So a little acceptance of that fact initially seem upsetting, but then when you get down to it anything that uses the smtpd for delivery is going to be checked for a valid mailbox anyhow. So using mailx locally might deliver mail to a mysteriously non-existant mailbox, create the folder etc. but anything using smtp can be controlled so it's only a local issue. Not one I'm going to over concern myself with as all incoming mail will be from trusted sources with strong identification and smtpd will do the lookup required.

### Dovecot

#### /etc/dovecot/conf.d/auth-ldap

    # Authentication for LDAP users. Included from auth.conf.
    #
    # 

    passdb {
      driver = ldap

      # Path for LDAP configuration file, see example-config/dovecot-ldap.conf.ext
      args = /etc/dovecot/dovecot-ldap-passdb.conf.ext
    }

    # "prefetch" user database means that the passdb already provided the
    # needed information and there's no need to do a separate userdb lookup.
    # 
    #userdb {
    #  driver = prefetch
    #}

    #userdb {
    #  driver = ldap
    #  args = /etc/dovecot/dovecot-ldap.conf.ext

    #  Default fields can be used to specify defaults that LDAP may override
    #  default_fields = home=/home/vmail/%u #, uid=vmail, gid=vmail

    #}

    # If you don't have any user-specific settings, you can avoid the userdb LDAP
    # lookup by using userdb static instead of userdb ldap, for example:
    # 
    userdb {
      driver = static
      args = uid=vmail gid=vmail home=/home/vmail/%u allow_all_users=yes
    }

#### /etc/dovecot/dovecot/dovecot-ldap.conf.ext (NOT USED)

    hosts = 192.168.0.5
    #uris = ldap://dc1.mydomain.local
    dn = readonly@mydomain.local
    dnpass = password
    ldap_version = 3

    base = dc=mydomain,dc=local
    deref = never
    scope = subtree

    user_filter = (&(objectClass=person)(userPrincipalName=%n@mydomain.local))
    user_attrs = =home=/home/vmail/%u@mydomain.local,=uid=5000,=gid=5000

    debug_level = 0

Note the separate userdb lookup config and passdb config. Passdb uses auth_bind = yes, but the userdb does not.

#### /etc/dovecot/dovecot-dovecot-ldap-passdb.ext.conf

    hosts = 192.168.0.5
    #uris = ldap://dc1.mydomain.local
    ldap_version = 3

    base = dc=mydomain,dc=local
    deref = never
    scope = subtree

    auth_bind = yes
    auth_bind_userdn = %u
    #auth_bind_userdn = CN=Read Only,CN=Users,DC=mydomain,DC=local
    #auth_bind_userdn = readonly@mydomain.local

    pass_filter = (&(objectClass=person)(userPrincipalName=%n))

    debug_level = 0

For the life of me I can't figure out why the %d doesn't return the domain name like it should. There are notes regarding if the %u username been manipulated that it loses the %d domain, but I can't see where that has been done and nothing gets logged about it changing with auth_debug turned on.

### Postfix

#### /etc/postfix/main.cf

    # See /usr/share/postfix/main.cf.dist for a commented, more complete version

    # Debian specific:  Specifying a file name will cause the first
    # line of that file to be used as the name.  The Debian default
    # is /etc/mailname.
    #myorigin = /etc/mailname

    smtpd_banner = $myhostname ESMTP $mail_name (Debian/GNU)
    biff = no

    # appending .domain is the MUA's job.
    append_dot_mydomain = no

    # Uncomment the next line to generate "delayed mail" warnings
    #delay_warning_time = 4h

    readme_directory = no

    # TLS parameters
    smtpd_tls_cert_file=/etc/ssl/certs/ssl-cert-snakeoil.pem
    smtpd_tls_key_file=/etc/ssl/private/ssl-cert-snakeoil.key
    smtpd_use_tls=yes
    smtpd_tls_session_cache_database = btree:${data_directory}/smtpd_scache
    smtp_tls_session_cache_database = btree:${data_directory}/smtp_scache

    # See /usr/share/doc/postfix/TLS_README.gz in the postfix-doc package for
    # information on enabling SSL in the smtp client.

    myhostname = mail.mydomain.local
    alias_maps = hash:/etc/aliases
    alias_database = hash:/etc/aliases
    myorigin = /etc/mailname
    mydestination = mail.mydomain.local, localhost.mydomain.local, localhost
    relayhost =
    mynetworks = 192.168.0.0/24 127.0.0.0/8 [::ffff:127.0.0.0]/104 [::1]/128
    mailbox_command = procmail -a "$EXTENSION"
    mailbox_size_limit = 0
    recipient_delimiter = +
    inet_interfaces = all

    virtual_mailbox_domains = mydomain.local
    virtual_mailbox_base = /home/vmail/
    virtual_mailbox_maps = ldap:/etc/postfix/ldap-users.cf
    virtual_uid_maps = static:5000
    virtual_gid_maps = static:5000
    virtual_transport = dovecot
    dovecot_destination_recipient_limit = 1

    smtpd_sasl_auth_enable = yes
    smtpd_sasl_security_options = noanonymous
    smtpd_sasl_local_domain = mydomain.local
    broken_sasl_auth_clients = yes
    smtpd_sasl_type = dovecot
    smtpd_sasl_path = private/auth

    smtpd_recipient_restrictions =
        permit_mynetworks,
        permit_sasl_authenticated

    # specify at least one working instance of: check_relay_domains, reject_unauth_destination, reject, defer or defer_if_permit

    smtpd_recipient_restrictions = permit_mynetworks,permit_sasl_authenticated,reject_unauth_destination

#### Added to /etc/postfix/master.cf

    dovecot   unix  -       n       n       -       -       pipe
      flags=DRhu user=vmail:vmail argv=/usr/lib/dovecot/dovecot-lda -f ${sender} -d ${recipient}

#### /etc/postfix/ldap-users.cf

    bind = yes
    bind_dn = readonly@mydomain.local
    bind_pw = password
    version = 3
    timeout = 20

    size_limit = 1
    expansion_limit = 0

    start_tls = no
    tls_require_cert = no

    server_host = ldap://dc1.mydomain.local/
    search_base = dc=mydomain,dc=local
    scope = sub
    query_filter = (&(objectClass=person)(userPrincipalName=%s))
    # query_filter = (&(objectClass=person)(|(mail=%s)(proxyAddresses=%s)))
    # result_attribute = sAMAccountName
    result_attribute = userPrincipalName
    result_format = %s
    special_result_filter = %s@%d

The ldap setup can get more complex. At this stage it's just using a simple user/mailbox lookup. Until we add more the mailboxes to a separate OU so they are more easily authenticated it's using a mashup for the userPrincipalName to get user@domain, but will eventually use the full DN of the user/mailbox eg. cn=%u,ou=Secure Mail,dc=mydomain,dc=local
