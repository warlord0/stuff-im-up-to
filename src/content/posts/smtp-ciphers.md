---
pubDatetime: 2020-07-16T15:30:32Z
modDatetime: 2020-07-16T15:31:44Z
title: "SMTP Ciphers"
tags:
  - "certificates"
  - "Linux"
  - "Security"
  - "ssl"
description: "What ciphers are used by your smtp server? Well that's a question I got asked today. Take a look at this testssl.sh - it spawned a whole report about my SM"
---
What ciphers are used by your smtp server? Well that's a question I got asked today.

Take a look at this `testssl.sh` - it spawned a whole report about my SMTP server that included ciphers and a whole lot more:

[https://github.com/drwetter/testssl.sh](https://github.com/drwetter/testssl.sh)

```
bash ./testssl.sh -t smtp smtp.server.com:587                                                                          

###########################################################
    testssl.sh       3.1dev from https://testssl.sh/dev/
    (19f2c28 2020-07-15 11:51:34 -- )

      This program is free software. Distribution and
             modification under GPLv2 permitted.
      USAGE w/o ANY WARRANTY. USE IT AT YOUR OWN RISK!

       Please file bugs @ https://testssl.sh/bugs/

###########################################################

 Using "OpenSSL 1.0.2-chacha (1.0.2k-dev)" [~183 ciphers]
 on detective:./bin/openssl.Linux.x86_64
 (built: "Jan 18 17:12:17 2019", platform: "linux-x86_64")


 Start 2020-07-16 16:19:43        -->> 136.143.182.56:587 (smtp.server.com) <<--

 rDNS (136.143.182.56):  --
 Service set:            STARTTLS via SMTP

 Testing protocols via sockets 

 SSLv2      not offered (OK)
 SSLv3      not offered (OK)
 TLS 1      offered (deprecated)
 TLS 1.1    offered (deprecated)
 TLS 1.2    offered (OK)
 TLS 1.3    not offered and downgraded to a weaker protocol

 Testing cipher categories 

 NULL ciphers (no encryption)                      not offered (OK)
 Anonymous NULL Ciphers (no authentication)        not offered (OK)
 Export ciphers (w/o ADH+NULL)                     not offered (OK)
 LOW: 64 Bit + DES, RC[2,4], MD5 (w/o export)      offered (NOT ok)
 Triple DES Ciphers / IDEA                         not offered
 Obsoleted CBC ciphers (AES, ARIA etc.)            offered
 Strong encryption (AEAD ciphers) with no FS       offered (OK)
 Forward Secrecy strong encryption (AEAD ciphers)  offered (OK)


 Testing server's cipher preferences 

 Has server cipher order?     no (NOT ok)
 Negotiated protocol          TLSv1.2
 Negotiated cipher            AES128-GCM-SHA256 -- inconclusive test, matching cipher in list missing, better see below
 Cipher per protocol

Hexcode  Cipher Suite Name (OpenSSL)       KeyExch.   Encryption  Bits     Cipher Suite Name (IANA/RFC)
-----------------------------------------------------------------------------------------------------------------------------
SSLv2
 - 
SSLv3
 - 
TLSv1 (no server order, thus listed by strength)
 xc014   ECDHE-RSA-AES256-SHA              ECDH 521   AES         256      TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA                 
 x35     AES256-SHA                        RSA        AES         256      TLS_RSA_WITH_AES_256_CBC_SHA                       
 xc013   ECDHE-RSA-AES128-SHA              ECDH 521   AES         128      TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA                 
 x2f     AES128-SHA                        RSA        AES         128      TLS_RSA_WITH_AES_128_CBC_SHA                       
 x05     RC4-SHA                           RSA        RC4         128      TLS_RSA_WITH_RC4_128_SHA                           
TLSv1.1 (no server order, thus listed by strength)
 xc014   ECDHE-RSA-AES256-SHA              ECDH 521   AES         256      TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA                 
 x35     AES256-SHA                        RSA        AES         256      TLS_RSA_WITH_AES_256_CBC_SHA                       
 xc013   ECDHE-RSA-AES128-SHA              ECDH 521   AES         128      TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA                 
 x2f     AES128-SHA                        RSA        AES         128      TLS_RSA_WITH_AES_128_CBC_SHA                       
 x05     RC4-SHA                           RSA        RC4         128      TLS_RSA_WITH_RC4_128_SHA                           
TLSv1.2 (no server order, thus listed by strength)
 xc030   ECDHE-RSA-AES256-GCM-SHA384       ECDH 521   AESGCM      256      TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384              
 xc014   ECDHE-RSA-AES256-SHA              ECDH 521   AES         256      TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA                 
 x9d     AES256-GCM-SHA384                 RSA        AESGCM      256      TLS_RSA_WITH_AES_256_GCM_SHA384                    
 x35     AES256-SHA                        RSA        AES         256      TLS_RSA_WITH_AES_256_CBC_SHA                       
 xc02f   ECDHE-RSA-AES128-GCM-SHA256       ECDH 521   AESGCM      128      TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256              
 xc027   ECDHE-RSA-AES128-SHA256           ECDH 521   AES         128      TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256              
 xc013   ECDHE-RSA-AES128-SHA              ECDH 521   AES         128      TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA                 
 x9c     AES128-GCM-SHA256                 RSA        AESGCM      128      TLS_RSA_WITH_AES_128_GCM_SHA256                    
 x3c     AES128-SHA256                     RSA        AES         128      TLS_RSA_WITH_AES_128_CBC_SHA256                    
 x2f     AES128-SHA                        RSA        AES         128      TLS_RSA_WITH_AES_128_CBC_SHA                       
 x05     RC4-SHA                           RSA        RC4         128      TLS_RSA_WITH_RC4_128_SHA                           
TLSv1.3
 - 


 Testing robust forward secrecy (FS) -- omitting Null Authentication/Encryption, 3DES, RC4 

 FS is offered (OK)           ECDHE-RSA-AES256-GCM-SHA384 ECDHE-RSA-AES256-SHA ECDHE-RSA-AES128-GCM-SHA256 ECDHE-RSA-AES128-SHA256
                              ECDHE-RSA-AES128-SHA 
 Elliptic curves offered:     prime256v1 secp384r1 secp521r1 


 Testing server defaults (Server Hello) 

 TLS extensions (standard)    "renegotiation info/#65281" "extended master secret/#23"
 Session Ticket RFC 5077 hint no -- no lifetime advertised
 SSL Session ID support       yes
 Session Resumption           Tickets no, ID: no
 TLS clock skew               -1 sec from localtime
 Signature Algorithm          SHA256 with RSA
 Server key size              RSA 2048 bits (exponent is 65537)
 Server key usage             Digital Signature, Key Encipherment
 Server extended key usage    TLS Web Server Authentication, TLS Web Client Authentication
 Serial / Fingerprints        025A65A6DF2A63F2D67DE9E5363A1058 / SHA1 6A870FB27C3AE522AF1C8FDB02D022C65E24E0E9
                              SHA256 569557FA02E5E88E2C0193B7094FD11641497F6F3871799BFD92869286E45831
 Common Name (CN)             *.server.com 
 subjectAltName (SAN)         *.server.com server.com 
 Issuer                       Thawte RSA CA 2018 (DigiCert Inc from US)
 Trust (hostname)             Ok via SAN wildcard and CN wildcard (same w/o SNI)
 Chain of trust               Ok   
 EV cert (experimental)       no 
 Bad OCSP intermediate (exp.) Ok
 ETS/"eTLS", visibility info  not present
 Certificate Validity (UTC)   248 >= 60 days (2019-03-23 00:00 --> 2021-03-22 12:00)
 # of certificates provided   3
 Certificate Revocation List  http://cdp.thawte.com/ThawteRSACA2018.crl
 OCSP URI                     http://status.thawte.com
 OCSP stapling                not offered
 OCSP must staple extension   --
 DNS CAA RR (experimental)    not offered
 Certificate Transparency     yes (certificate extension)


 Testing vulnerabilities 

 Heartbleed (CVE-2014-0160)                not vulnerable (OK), no heartbeat extension
 CCS (CVE-2014-0224)                       not vulnerable (OK)
 ROBOT                                     not vulnerable (OK)
 Secure Renegotiation (RFC 5746)           supported (OK)
 Secure Client-Initiated Renegotiation     VULNERABLE (NOT ok), potential DoS threat
 CRIME, TLS (CVE-2012-4929)                not vulnerable (OK) (not using HTTP anyway)
 POODLE, SSL (CVE-2014-3566)               not vulnerable (OK), no SSLv3 support
 TLS_FALLBACK_SCSV (RFC 7507)              Rerun including POODLE SSL check. Downgrade attack prevention NOT supported
 SWEET32 (CVE-2016-2183, CVE-2016-6329)    not vulnerable (OK)
 FREAK (CVE-2015-0204)                     not vulnerable (OK)
 DROWN (CVE-2016-0800, CVE-2016-0703)      not vulnerable on this host and port (OK)
                                           make sure you don't use this certificate elsewhere with SSLv2 enabled services
                                           https://censys.io/ipv4?q=569557FA02E5E88E2C0193B7094FD11641497F6F3871799BFD92869286E45831 could help you to find out
 LOGJAM (CVE-2015-4000), experimental      not vulnerable (OK): no DH EXPORT ciphers, no DH key detected with <= TLS 1.2
 BEAST (CVE-2011-3389)                     TLS1: ECDHE-RSA-AES256-SHA AES256-SHA ECDHE-RSA-AES128-SHA AES128-SHA 
                                           VULNERABLE -- but also supports higher protocols  TLSv1.1 TLSv1.2 (likely mitigated)
 LUCKY13 (CVE-2013-0169), experimental     potentially VULNERABLE, uses cipher block chaining (CBC) ciphers with TLS. Check patches
 RC4 (CVE-2013-2566, CVE-2015-2808)        VULNERABLE (NOT ok): RC4-SHA 


 Running client simulations via sockets 

 Android 8.1 (native)         TLSv1.2 ECDHE-RSA-AES128-GCM-SHA256, 256 bit ECDH (P-256)
 Android 9.0 (native)         TLSv1.2 ECDHE-RSA-AES128-GCM-SHA256, 256 bit ECDH (P-256)
 Android 10.0 (native)        TLSv1.2 ECDHE-RSA-AES128-GCM-SHA256, 256 bit ECDH (P-256)
 Java 6u45                    TLSv1.0 AES128-SHA, No FS
 Java 7u25                    TLSv1.0 ECDHE-RSA-AES128-SHA, 256 bit ECDH (P-256)
 Java 8u161                   TLSv1.2 ECDHE-RSA-AES256-SHA, 256 bit ECDH (P-256)
 Java 11.0.2 (OpenJDK)        TLSv1.2 ECDHE-RSA-AES256-GCM-SHA384, 256 bit ECDH (P-256)
 Java 12.0.1 (OpenJDK)        TLSv1.2 ECDHE-RSA-AES256-GCM-SHA384, 256 bit ECDH (P-256)
 OpenSSL 1.0.2e               TLSv1.2 ECDHE-RSA-AES256-GCM-SHA384, 256 bit ECDH (P-256)
 OpenSSL 1.1.0l (Debian)      TLSv1.2 ECDHE-RSA-AES256-GCM-SHA384, 256 bit ECDH (P-256)
 OpenSSL 1.1.1d (Debian)      TLSv1.2 ECDHE-RSA-AES256-GCM-SHA384, 256 bit ECDH (P-256)
 Thunderbird (68.3)           TLSv1.2 ECDHE-RSA-AES128-GCM-SHA256, 256 bit ECDH (P-256)


 Rating (experimental) 

 Rating specs (not complete)  SSL Labs's 'SSL Server Rating Guide' (version 2009q from 2020-01-30)
 Specification documentation  https://github.com/ssllabs/research/wiki/SSL-Server-Rating-Guide
 Protocol Support (weighted)  0 (0)
 Key Exchange     (weighted)  0 (0)
 Cipher Strength  (weighted)  0 (0)
 Final Score                  0
 Overall Grade                T
 Grade cap reasons            Grade capped to T. Encryption via STARTTLS is not mandatory (opportunistic).
                              Grade capped to B. TLS 1.1 offered
                              Grade capped to B. TLS 1.0 offered
                              Grade capped to B. RC4 ciphers offered
                              Grade capped to A. Does not support TLS_FALLBACK_SCSV

 Done 2020-07-16 16:24:05 [ 266s] -->> 136.143.182.56:587 (smtp.server.com) <<--
```

*Not output from one of our servers - just a random smtp server.*
