---
pubDatetime: 2017-02-03T10:24:45Z
modDatetime: 2017-02-03T11:53:47Z
title: "SSL/TLS Diffie-Hellman Modulus <= 1024 Bits (Logjam) - Tomcat"
tags:
  - "Security"
  - "ssl"
  - "Web"
description: "Disable the ciphers that use Diffie-Hellman by adding !DHE into your ciphers list ciphers=\"HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!kRSA:!3DES:!DHE\" Now"
---
Disable the ciphers that use Diffie-Hellman by adding `!DHE` into your ciphers list

    ciphers="HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!kRSA:!3DES:!DHE"

Now when I run `nmap` I get a very reduced list of available ciphers. Hopefully all my clients will be able to make use of one of them!

    $ nmap --script +ssl-enum-ciphers -Pn myserver -p 8443

    Starting Nmap 6.47 ( http://nmap.org ) at 2017-02-03 11:51 GMT
    Nmap scan report for playground (192.168.0.150)
    Host is up (0.00054s latency).
    rDNS record for 192.168.0.150: myserver.domain.local
    PORT STATE SERVICE
    8443/tcp open https-alt
    | ssl-enum-ciphers: 
    | TLSv1.0: 
    | ciphers: 
    | TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA - strong
    | TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA - strong
    | compressors: 
    | NULL
    | TLSv1.1: 
    | ciphers: 
    | TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA - strong
    | TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA - strong
    | compressors: 
    | NULL
    | TLSv1.2: 
    | ciphers: 
    | TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA - strong
    | TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256 - strong
    | TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 - strong
    | TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA - strong
    | TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384 - strong
    | TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 - strong
    | compressors: 
    | NULL
    |_ least strength: strong

    Nmap done: 1 IP address (1 host up) scanned in 0.45 seconds
