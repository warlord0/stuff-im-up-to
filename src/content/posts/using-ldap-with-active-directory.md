---
pubDatetime: 2016-09-22T10:19:33Z
modDatetime: 2016-09-26T09:47:51Z
title: "Using LDAP with Active Directory"
tags:
  - "active directory"
  - "ldap"
  - "Linux"
  - "Networking"
  - "Security"
  - "ssl"
description: "Getting your Linux box to talk with Active Directory is pretty straight forward. But doing it securely will need you to have installed your CA certificate"
---
Getting your Linux box to talk with Active Directory is pretty straight forward. But doing it securely will need you to have installed your CA certificate into your trusted certificates. Mostly I'll only setup anything to do with LDAP/Active Directory is a specific application requires it, otherwise I'll leave out the Windows authentication bit. I generally don't use LDAP/AD for the SSH PAM type logons and will configure LDAP when a web server or the like uses it, eg. php5-ldap is required.

## Testing the Connection

As all I need is to endure the certificates are trusted and then configure the web server application to point to the domain controller no other LDAP programs are really needed. But I'd install 'ldap-utils' just so you can test this stuff out using ldapsearch. Of course if your web app works then there's no need for this, but it's handy for testing.

    $ sudo apt-get install ldap-utils

Then you can use ldapsearch to find a user account and prove your connection actually works.

    $ ldapsearch -D "CN=Read Only,CN=Users,DC=mydomain,DC=local" -h dc1.mydomain.local -x -W -b "dc=mydomain,dc=local" "(sAMAccountName=myloginname)" -ZZ cn

What's all this?

- -D = Use this DN to bind to the server as (the logon to use)
- -h = the domain controller to use
- -x = Carry out a bind so you do a trusted search rather than trying anonymously
- -W = Ask for the password for the -D account
- -b = The base dn to search from
- "(sAMAccountName=myloginname)" = The LDAP query to run
- **-ZZ = Use STARTTLS to encrypt the traffic**
- cn = The only attribute to return

The -ZZ is the important part for security. You'll also find out if your certificate works as it should. If not you'll get an error back. This is where you'll probably get back an error like:

    ldap_start_tls: Connect error (-11)
        additional info: TLS: hostname does not match CN in peer certificate

It's a simple fix and one you'll need to carry through to your web app config. When using TLS the server name must match the name passed inside the certificate. Many times this will need to be the FQDN eg. dc1.mydomain.local NOT just dc1, so make absolutely sure in your config you specify it in full. This also applies if you're trying to use the IP address, don't. Use the FQDN.

> You could always reconfigure your CA server so that it issues certificates with "Subject Alternative Names" (SANs) that have all variations of FQDN, short name and IP address, but that's beyond the scope of this article.

See also: [CA Certificates](https://warlord0blog.wordpress.com/2016/09/22/ca-certificates/)
