---
pubDatetime: 2017-01-20T12:38:23Z
modDatetime: 2017-02-06T21:32:11Z
title: "SSL 64-bit Block Size Cipher Suites Supported (SWEET32)"
tags:
  - "Security"
  - "Windows"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "Nessus reports a vulnerability because of 64-bit cipher suites and SSL Medium Strength Cipher Suites Supported (even though it shows up as strong ). Window"
---
Nessus reports a vulnerability because of 64-bit cipher suites and SSL Medium Strength Cipher Suites Supported (even though it shows up as **strong**). Windows requires the cipher TLS_RSA_WITH_3DES_EDE_CBC_SHA being disabled. I found that adding the cipher suite to the registry didn't work as expected. Then I found a reference that says it's a different key based on the version of Windows. So I added both to our registry file to handle disabling it regardless. Registry file:

    Windows Registry Editor Version 5.00
    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\DES 56/56]
    "Enabled"=dword:00000000
    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\RC2 40/128]
    "Enabled"=dword:00000000
    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\RC4 40/128]
    "Enabled"=dword:00000000
    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\RC4 56/128]
    "Enabled"=dword:00000000
    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\RC4 128/128]
    "Enabled"=dword:00000000
    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\Triple DES 168/168]
    "Enabled"=dword:00000000
    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\Triple DES 168]
    "Enabled"=dword:00000000

Before:

    $ nmap --script +ssl-enum-ciphers -p 3389 iprintsrvr -Pn

    Starting Nmap 6.47 ( http://nmap.org ) at 2017-01-20 12:28 GMT
    Nmap scan report for iprintsrvr (192.168.0.181)
    Host is up (0.00051s latency).
    rDNS record for 192.168.0.181: iprintsrvr.domain.local
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

    Nmap done: 1 IP address (1 host up) scanned in 6.30 seconds

After:

    $ nmap --script +ssl-enum-ciphers -p 3389 iprintsrvr -Pn

    Starting Nmap 6.47 ( http://nmap.org ) at 2017-01-20 12:29 GMT
    Nmap scan report for iprintsrvr (192.168.0.181)
    Host is up (0.00028s latency).
    rDNS record for 192.168.0.181: iprintsrvr.domain.local
    PORT STATE SERVICE
    3389/tcp open ms-wbt-server
    | ssl-enum-ciphers: 
    | TLSv1.0: 
    | ciphers: 
    | TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA - strong
    | TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA - strong
    | TLS_RSA_WITH_AES_128_CBC_SHA - strong
    | TLS_RSA_WITH_AES_256_CBC_SHA - strong
    | compressors: 
    | NULL
    |_ least strength: strong

    Nmap done: 1 IP address (1 host up) scanned in 0.15 seconds

### References

See **Note** For the versions of Windows that releases before Windows Vista, the key should be Triple DES 168/168. [https://support.microsoft.com/en-us/help/245030/how-to-restrict-the-use-of-certain-cryptographic-algorithms-and-protocols-in-schannel.dll](https://support.microsoft.com/en-us/help/245030/how-to-restrict-the-use-of-certain-cryptographic-algorithms-and-protocols-in-schannel.dll)
