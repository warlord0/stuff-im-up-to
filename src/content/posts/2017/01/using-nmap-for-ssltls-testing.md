---
pubDatetime: 2017-01-20T11:29:08Z
modDatetime: 2017-01-20T18:28:24Z
title: "Using NMAP for SSL/TLS Testing"
tags:
  - "certificates"
  - "Linux"
  - "Security"
  - "Windows"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "NMAP is a great too for port monitoring but it also has some scripting features that are really handy to find weaknesses in your SSL/TLS deployments. You c"
---
NMAP is a great too for port monitoring but it also has some scripting features that are really handy to find weaknesses in your SSL/TLS deployments. You can find out details about certificate and ciphers by using the default supplied scripts. You can use `ls -l /usr/share/nmap/scripts` to list what scripts are available. Use ssl-cert to view the certificate details. Example using port 636 for the secure ldap service.

    $ nmap --script ssl-cert -p 636 dc1.domain.local

    Starting Nmap 6.47 ( http://nmap.org ) at 2017-01-20 11:18 GMT
    Nmap scan report for dc1srvr (192.168.0.55)
    Host is up (0.00036s latency).
    PORT STATE SERVICE
    636/tcp open ldapssl
    | ssl-cert: Subject: commonName=dc1.domain.local
    | Issuer: commonName=dc1
    | Public Key type: rsa
    | Public Key bits: 2048
    | Not valid before: 2016-10-17T15:10:21+00:00
    | Not valid after: 2021-10-16T15:10:21+00:00
    | MD5: 144e 4c83 c646 d4f5 57ce 03ac 667a e8a3
    |_SHA-1: f56b 5685 7953 bd63 6a1a 7035 abb9 4dab 5ba7 70c7

    Nmap done: 1 IP address (1 host up) scanned in 0.07 seconds

Use ssl-enum-ciphers to find out what ciphers are in use so you can go disable any weak ones.

    $ nmap --script ssl-enum-ciphers -p 636 dc1.domain.local

    636/tcp open ldapssl
    | ssl-enum-ciphers: 
    | TLSv1.0: 
    | ciphers: 
    | TLS_DHE_RSA_WITH_AES_128_CBC_SHA - strong
    | TLS_DHE_RSA_WITH_AES_256_CBC_SHA - strong
    | TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA - strong
    | TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA - strong
    | TLS_RSA_WITH_3DES_EDE_CBC_SHA - strong
    | TLS_RSA_WITH_AES_128_CBC_SHA - strong
    | TLS_RSA_WITH_AES_256_CBC_SHA - strong
    | compressors: 
    | NULL
    | TLSv1.1: 
    | ciphers: 
    | TLS_DHE_RSA_WITH_AES_128_CBC_SHA - strong
    | TLS_DHE_RSA_WITH_AES_256_CBC_SHA - strong
    | TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA - strong
    | TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA - strong
    | TLS_RSA_WITH_3DES_EDE_CBC_SHA - strong
    | TLS_RSA_WITH_AES_128_CBC_SHA - strong
    | TLS_RSA_WITH_AES_256_CBC_SHA - strong
    | compressors: 
    | NULL
    |_ least strength: strong

### SSL scripts only work with certain ports!

You'll see above it works fine against port 636 and similarly against port 443. This is because there are rules that the script uses to allow it only to be run against certain ports. This is to prevent scans against a wide range of ports causing havok by testing ssl all over the place. So to force the issue and make it ignore the rules simply add a + sign. The most common scans we seem to do are for RDP on port 3389. This doesn't work unless we specify the + to bypass the rules. So if you're being port specific then the + works well, but I wouldn't use it against a port scan like -sV, only where I use -p to be clear.

    $ nmap --script +ssl-enum-ciphers -p 3389 printsrvr

    Starting Nmap 6.47 ( http://nmap.org ) at 2017-01-20 11:36 GMT
    Nmap scan report for printsrvr (192.168.0.180)
    Host is up (0.00032s latency).
    rDNS record for 192.168.0.180: printsrvr.domain.local
    PORT STATE SERVICE
    3389/tcp open ms-wbt-server
    | ssl-enum-ciphers: 
    | TLSv1.0: 
    | ciphers: 
    | TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA - strong
    | TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA - strong
    | TLS_RSA_WITH_3DES_EDE_CBC_SHA - strong
    | TLS_RSA_WITH_AES_128_CBC_SHA - strong
    | TLS_RSA_WITH_AES_256_CBC_SHA - strong
    | compressors: 
    | NULL
    |_ least strength: strong

    Nmap done: 1 IP address (1 host up) scanned in 0.14 seconds
