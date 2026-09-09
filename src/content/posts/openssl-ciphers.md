---
pubDatetime: 2017-03-01T13:27:28Z
modDatetime: 2020-01-29T11:42:32Z
title: "OpenSSL Ciphers"
tags:
  - "Linux"
  - "Security"
  - "ssl"
  - "Windows"
description: "OpenSSL is a very handy tool. Both on Linux and Windows. On both you can do all kinds of conversions and creations, but equally of use you can view cipher"
---
OpenSSL is a very handy tool. Both on Linux and Windows. On both you can do all kinds of conversions and creations,  but equally of use you can view cipher details that are supported.

On Linux systems OpenSSL will look for `/usr/local/ssl/openssl.cnf`, or on some flavours `/etc/ssl/openssl.cnf` or even `/usr/lib/ssl/openssl.cnf` and on windows it will show a warning.

```
WARNING: can't open config file: /usr/local/ssl/openssl.cnf
```

To specify what `openssl.cnf` to use in Windows you must set an environment variable in your system settings or from the command line:

```
c:\> set OPENSSL_CONF=c:/openssl/openssl.cnf
c:\> openssl.exe ciphers
ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA:ECDHE-ECDSA-AES256-SHA:SRP-DSS-AES-256-CBC-SHA:SRP-RSA-AES-256-CBC-SHA:SRP-AES-256-CBC-SHA:DH-DSS-AES256-GCM-SHA384:DHE-DSS-AES256-GCM-SHA384:DH-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-SHA256:DHE-DSS-AES256-SHA256:DH-RSA-AES256-SHA256:DH-DSS-AES256-SHA256:DHE-RSA-AES256-SHA:DHE-DSS-AES256-SHA:DH-RSA-AES256-SHA:DH-DSS-AES256-SHA:DHE-RSA-CAMELLIA256-SHA:DHE-DSS-CAMELLIA256-SHA:DH-RSA-CAMELLIA256-SHA:DH-DSS-CAMELLIA256-SHA:ECDH-RSA-AES256-GCM-SHA384:ECDH-ECDSA-AES256-GCM-SHA384:ECDH-RSA-AES256-SHA384:ECDH-ECDSA-AES256-SHA384:ECDH-RSA-AES256-SHA:ECDH-ECDSA-AES256-SHA:AES256-GCM-SHA384:AES256-SHA256:AES256-SHA:CAMELLIA256-SHA:PSK-AES256-CBC-SHA:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-SHA256:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA:ECDHE-ECDSA-AES128-SHA:SRP-DSS-AES-128-CBC-SHA:SRP-RSA-AES-128-CBC-SHA:SRP-AES-128-CBC-SHA:DH-DSS-AES128-GCM-SHA256:DHE-DSS-AES128-GCM-SHA256:DH-RSA-AES128-GCM-SHA256:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES128-SHA256:DHE-DSS-AES128-SHA256:DH-RSA-AES128-SHA256:DH-DSS-AES128-SHA256:DHE-RSA-AES128-SHA:DHE-DSS-AES128-SHA:DH-RSA-AES128-SHA:DH-DSS-AES128-SHA:DHE-RSA-SEED-SHA:DHE-DSS-SEED-SHA:DH-RSA-SEED-SHA:DH-DSS-SEED-SHA:DHE-RSA-CAMELLIA128-SHA:DHE-DSS-CAMELLIA128-SHA:DH-RSA-CAMELLIA128-SHA:DH-DSS-CAMELLIA128-SHA:ECDH-RSA-AES128-GCM-SHA256:ECDH-ECDSA-AES128-GCM-SHA256:ECDH-RSA-AES128-SHA256:ECDH-ECDSA-AES128-SHA256:ECDH-RSA-AES128-SHA:ECDH-ECDSA-AES128-SHA:AES128-GCM-SHA256:AES128-SHA256:AES128-SHA:SEED-SHA:CAMELLIA128-SHA:IDEA-CBC-SHA:PSK-AES128-CBC-SHA:ECDHE-RSA-RC4-SHA:ECDHE-ECDSA-RC4-SHA:ECDH-RSA-RC4-SHA:ECDH-ECDSA-RC4-SHA:RC4-SHA:RC4-MD5:PSK-RC4-SHA:ECDHE-RSA-DES-CBC3-SHA:ECDHE-ECDSA-DES-CBC3-SHA:SRP-DSS-3DES-EDE-CBC-SHA:SRP-RSA-3DES-EDE-CBC-SHA:SRP-3DES-EDE-CBC-SHA:EDH-RSA-DES-CBC3-SHA:EDH-DSS-DES-CBC3-SHA:DH-RSA-DES-CBC3-SHA:DH-DSS-DES-CBC3-SHA:ECDH-RSA-DES-CBC3-SHA:ECDH-ECDSA-DES-CBC3-SHA:DES-CBC3-SHA:PSK-3DES-EDE-CBC-SHA
```

Which gave us a huge list of supported ciphers.

You can also use it to list ciphers by group eg.

```
$ openssl ciphers -v 'MEDIUM'
$ openssl ciphers -v 'HIGH'
$ openssl ciphers -v 'SHA1'
```

Which is very useful to see what ciphers you're disabling when you see in your vulnerability scans that you should disable a particular group by name.

**Note**: Notice the lower case `-v` option? This gives us a verbose output. Try it again with an uppercase `-V` option and it's even more verbose. The interesting link from this is that if you use https://www.ssllabs.com for testing your SSL it shows you the OpenSSL ID of the cipher. Which cuts down on the ambiguity of names with dashes or underscores. Now you can match the ID by Hex value. eg.

```
0xC0,0x2F - ECDHE-RSA-AES128-GCM-SHA256 TLSv1.2 Kx=ECDH Au=RSA Enc=AESGCM(128) Mac=AEAD
0xC0,0x2B - ECDHE-ECDSA-AES128-GCM-SHA256 TLSv1.2 Kx=ECDH Au=ECDSA Enc=AESGCM(128) Mac=AEAD
0xC0,0x27 - ECDHE-RSA-AES128-SHA256 TLSv1.2 Kx=ECDH Au=RSA Enc=AES(128) Mac=SHA256
0xC0,0x23 - ECDHE-ECDSA-AES128-SHA256 TLSv1.2 Kx=ECDH Au=ECDSA Enc=AES(128) Mac=SHA256
0xC0,0x13 - ECDHE-RSA-AES128-SHA SSLv3 Kx=ECDH Au=RSA Enc=AES(128) Mac=SHA1
0xC0,0x09 - ECDHE-ECDSA-AES128-SHA SSLv3 Kx=ECDH Au=ECDSA Enc=AES(128) Mac=SHA1
```

Kx = Key Exchange, Au = Authentication, Enc = Encryption, Mac = Message Authentication Code

Some programs like Tomcat disable ciphers by group or name eg.

```
ciphers="HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!kRSA:!ECDHE-RSA-DES-CBC3-SHA"
```

You can now decipher what it means. Use ciphers in the HIGH cipher group, (! means exclude) DON'T use any cipher in the aNULL, eNULL, EXPORT, DES, RC4, MD5 kRSA groups and DON'T use the specific algorithm ECDHE-RSA-DES-CBC3-SHA.

The above example could easily apply to many other programs like Dovecot, Postfix and Nginx. All have their own config files that may have different ciphers enabled or disabled in much the same way.

## References

https://www.openssl.org/community/binaries.html

http://httpd.apache.org/docs/2.2/mod/mod_ssl.html#sslciphersuite

https://en.wikipedia.org/wiki/Cipher_suite
