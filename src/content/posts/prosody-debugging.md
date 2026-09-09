---
pubDatetime: 2021-02-09T20:38:12Z
modDatetime: 2021-02-09T20:41:09Z
title: "Prosody Debugging"
tags:
  - "certificates"
  - "Linux"
  - "xmpp"
description: "After building an ejabberd container set I'm continuing my foray into the world of xmpp by looking at prosody . I've run into a few man traps along the way"
---
After building an ejabberd container set I'm continuing my foray into the world of xmpp by looking at [prosody](https://prosody.im). I've run into a few man traps along the way and thought I'd document some of my failings to act as a catch all for search engines to help others with similar issues.

Are the certificates in place? Use `openssl` to find out.

```
echo | openssl s_client -starttls xmpp -connect domain.tld:5222 -servername xmpp.domain.tld -tls1_3
```

Should return a valid certificate response. This example is using the staging certificates from Let's Encrypt.

```
CONNECTED(00000003)
depth=1 CN = Fake LE Intermediate X1
verify error:num=20:unable to get local issuer certificate
verify return:1
depth=0 CN = domain.tld
verify return:1
---
Certificate chain
 0 s:CN = domain.tld
   i:CN = Fake LE Intermediate X1
 1 s:CN = Fake LE Intermediate X1
   i:CN = Fake LE Root X1
---
Server certificate
-----BEGIN CERTIFICATE-----
MIIGDTCCBPWgAwIBAgITAPqWVxOwes6fGd37+/qroZZGaDANBgkqhkiG9w0BAQsF
ADAiMSAwHgYDVQQDDBdGYWtlIExFIEludGVybWVkaWF0ZSBYMTAeFw0yMTAxMzAx
ODE5NDJaFw0yMTA0MzAxODE5NDJaMB8xHTAbBgNVBAMTFHdoYWxlc2FuY3R1YXJ5
...
fvnK2lEm1Z6Mgial9BlS9C12OiuOWWhgwAgBFyauKYvbA3XoM0EJpa05lrtd8f6x
kberDMYPFFuCvu/TM3kEFDvUSh88kZGRyxELWP9dukgO5c2yGINT0HPzbLbIW3Hl
ZD2cnL3/EJCWrYThOUnojY67nCMCKXVK6FH7uKP6ICPKwL0KHzuRfWbJUUa6NzmO
dVy4yricXFFLvjaVX5AWCWc=
-----END CERTIFICATE-----
subject=CN = domain.tld

issuer=CN = Fake LE Intermediate X1

---
No client certificate CA names sent
Requested Signature Algorithms: ECDSA+SHA256:ECDSA+SHA384:ECDSA+SHA512:Ed25519:Ed448:RSA-PSS+SHA256:RSA-PSS+SHA384:RSA-PSS+SHA512:RSA-PSS+SHA256:RSA-PSS+SHA384:RSA-PSS+SHA512:RSA+SHA256:RSA+SHA384:RSA+SHA512:ECDSA+SHA224:RSA+SHA224
Shared Requested Signature Algorithms: ECDSA+SHA256:ECDSA+SHA384:ECDSA+SHA512:Ed25519:Ed448:RSA-PSS+SHA256:RSA-PSS+SHA384:RSA-PSS+SHA512:RSA-PSS+SHA256:RSA-PSS+SHA384:RSA-PSS+SHA512:RSA+SHA256:RSA+SHA384:RSA+SHA512
Peer signing digest: SHA256
Peer signature type: RSA-PSS
Server Temp Key: ECDH, P-384, 384 bits
---
SSL handshake has read 3899 bytes and written 849 bytes
Verification error: unable to get local issuer certificate
---
New, TLSv1.3, Cipher is TLS_AES_256_GCM_SHA384
Server public key is 2048 bit
Secure Renegotiation IS NOT supported
Compression: NONE
Expansion: NONE
No ALPN negotiated
Early data was not sent
Verify return code: 20 (unable to get local issuer certificate)
---
DONE
```

Check Config

```
prosodyctl check
```

Should return something like this:

```
Checking config...
Done.

Checking DNS for host domain.tld...
    Host xmpp.domain.tld. does not seem to resolve to this server (IPv4/IPv6)

Checking DNS for component xmpp.domain.tld...
    File transfer proxy xmpp.domain.tld has no A/AAAA record. Create one or set 'proxy65_address' to the correct host/IP.
    Host xmpp.domain.tld does not seem to resolve to this server (IPv4/IPv6)

Checking DNS for component chat.domain.tld...
    Host chat.domain.tld does not seem to resolve to this server (IPv4/IPv6)

Checking certificates...
Checking certificate for domain.tld
  Certificate: /etc/prosody/certs/domain.tld/fullchain.pem
Checking certificate for xmpp.domain.tld
  Certificate: /etc/prosody/certs/xmpp.domain.tld/fullchain.pem
Checking certificate for chat.domain.tld
  Certificate: /etc/prosody/certs/chat.domain.tld/fullchain.pem

All checks passed, congratulations!
```

Certificates in log file should be found something like:

```
Jan 31 15:17:02 certmanager     debug   Searching /etc/prosody/certs for a key and certificate for domain.tld...
Jan 31 15:17:02 certmanager     debug   Selecting certificate /etc/prosody/certs/domain.tld/fullchain.pem with key /etc/prosody/certs/domain.tld/privkey.pem for domain.tld
Jan 31 15:17:02 domain.tld:tls        debug   Creating context for s2sout
Jan 31 15:17:02 certmanager     debug   Searching /etc/prosody/certs for a key and certificate for domain.tld...
Jan 31 15:17:02 certmanager     debug   Selecting certificate /etc/prosody/certs/domain.tld/fullchain.pem with key /etc/prosody/certs/domain.tld/privkey.pem for domain.tld
Jan 31 15:17:02 domain.tld:tls        debug   Creating context for s2sin
Jan 31 15:17:02 certmanager     debug   Searching /etc/prosody/certs for a key and certificate for domain.tld...
Jan 31 15:17:02 certmanager     debug   Selecting certificate /etc/prosody/certs/domain.tld/fullchain.pem with key /etc/prosody/certs/domain.tld/privkey.pem for domain.tld
Jan 31 15:17:02 domain.tld:tls        info    Certificates loaded
```

I found a problem like this in the log was actually caused by the `tls` module not being loaded.

```
Jan 30 16:08:21 certmanager     debug   Searching /etc/prosody/certs for a key and certificate for client_https...
Jan 30 16:08:21 certmanager     debug   No certificate/key found for client_https
```

The automated loading of certificates is explained in the docs, but if you don't include the `tls` module it will still try to load certificates and fail as if they don't exist. You can and up chasing your tail renaming certificates, specifying exact paths in the config with `certificate` and` key` entries and still it fails. Only to find you aren't loading the `tls` module.
