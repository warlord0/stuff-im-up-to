---
pubDatetime: 2015-07-21T07:49:30Z
modDatetime: 2016-09-19T17:35:39Z
title: "SSL CA Certificates"
tags:
  - "certificates"
  - "Linux"
  - "ssl"
description: "In order to get LDAP etc. using SSL from the get go you need to make sure the LDAP client has the CA certificate that was used to issue the certificate to"
---
In order to get LDAP etc. using SSL from the get go you need to make sure the LDAP client has the CA certificate that was used to issue the certificate to the LDAP server. Grab the CA certificate in PEM format and copy it into the /etc/ssl/certs folder. Then merge it into the ca-certificates.crt file. And for good measure copy in the certificate from the host too.

    # cp ~/my-ca-cert.pem /etc/ssl/certs
    # cat /etc/ssl/certs/my-ca-cert.pem >> /etc/ssl/certs/ca-certificates.crt
    # cp ~/my-server.pem /etc/ssl/certs

Then you need to create some symbolic links to get the SSL lookups working as the certificates are looked up by hash not host/filename. Once done use c_rehash to update the database hashes.

    # ln -s my-ca-cert.pem 'openssl x509 -hash -noout -in my-ca-cert'.0
    # ln -s my-server.pem 'openssl x509 -hash -noout -in my-server'.0

    # c_rehash

You can get the server certificate by connecting to is with openssl

    # openssl s_client -showcerts -connect my-server:636 > my-server.txt

Then edit the my-server.txt and extract the certificate.
