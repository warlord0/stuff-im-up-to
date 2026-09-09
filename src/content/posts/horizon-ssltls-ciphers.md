---
pubDatetime: 2017-02-25T10:19:59Z
modDatetime: 2017-02-25T10:27:22Z
title: "Horizon SSL/TLS Ciphers"
tags:
  - "horizon"
  - "ssl"
  - "vmware"
  - "Windows"
description: "After running an SSL scan on our external facing Horizon Security Server, using Qualys' SSLTest and receiving an A- rating, I wanted to fix that by getting"
---
After running an SSL scan on our external facing Horizon Security Server, using [Qualys' SSLTest](https://www.ssllabs.com/ssltest/) and receiving an A- rating, I wanted to fix that by getting at least an A. But in order to do that I needed to understand what was required to get it to an A. The problem I faced was that I was being marked down for not supporting Perfect Forward Secrecy (PFS).

> **The server does not support Forward Secrecy with the reference browsers. Grade reduced to A-**

To resolve it I had to find what ciphers had PFS support and to do that I just had to look for a site that had an A rating that didn't have a PFS issue. So I took a look at the Qualys results for [www.google.co.uk](https://www.ssllabs.com/ssltest/analyze.html?d=www.google.co.uk&s=172.217.6.67&latest). This showed as an A rating and had no PFS problem. So looking at the ciphers it supports I thought I'd just use the same list in my Horizon config and see where that leads. In order to make specific changes to TLS and cipher settings on the Horizon Security Server (SSL Gateway) you need to create a file called `locked.properties` in the `conf` folder. You'll find it under `c:\Program Files\VMware\VMware View\Server\sslgateway`. Then it's just a case of adding in the ciphers and protocols you want active. Scroll down to the Cipher Suites listing in the Qualys results and I'm only interested in the TLS1.1 and 1.2 sections as 1.0 is disabled. I also only want the ciphers that are marked as **FS** which are my PFS ciphers. Not all of the ciphers listed here are supported by Horizon, notably the CHACHA20 cipher. Also some of the ciphers have a key size that is reported as too small by our vulnerability scanning 112bit \< 128bit. So the only ones I can use are highligted and the good news is I can copy them exactly to paste them into my `locked.properties` file.

### Cipher Suites

**\# TLS 1.2 (suites in server-preferred order)** TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (0xc02f) ECDH x25519 (eq. 3072 bits RSA) **FS** 128 TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256 (0xcca8) ECDH x25519 (eq. 3072 bits RSA) **FS** 256P TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA (0xc013) ECDH x25519 (eq. 3072 bits RSA) **FS** 128 TLS_RSA_WITH_AES_128_GCM_SHA256 (0x9c) 128 TLS_RSA_WITH_AES_128_CBC_SHA (0x2f) 128 TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (0xc030) ECDH x25519 (eq. 3072 bits RSA) **FS** 256 TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA (0xc014) ECDH x25519 (eq. 3072 bits RSA) **FS** 256 TLS_RSA_WITH_AES_256_GCM_SHA384 (0x9d) 256 TLS_RSA_WITH_AES_256_CBC_SHA (0x35) 256 TLS_RSA_WITH_3DES_EDE_CBC_SHA (0xa) 112 **\# TLS 1.1 (suites in server-preferred order)** TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA (0xc013) ECDH x25519 (eq. 3072 bits RSA) **FS** 128 TLS_RSA_WITH_AES_128_CBC_SHA (0x2f) 128 TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA (0xc014) ECDH x25519 (eq. 3072 bits RSA) **FS** 256 TLS_RSA_WITH_AES_256_CBC_SHA (0x35) 256 TLS_RSA_WITH_3DES_EDE_CBC_SHA (0xa) 112 So I ended up with a `locked.properties` file that looks like this. Restart the VMware Security Server service after you make any changes. If it fails to start check everything is spelt right in here or just delete the file to resort to the defaults.

    # The following list should be ordered with the latest protocol first:
    secureProtocols.1=TLSv1.2
    secureProtocols.2=TLSv1.1

    # This setting must be the latest protocol given in the list above:
    preferredSecureProtocol=TLSv1.2

    # The order of the following list is unimportant:
    enabledCipherSuite.1=TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
    enabledCipherSuite.2=TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA
    enabledCipherSuite.3=TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
    enabledCipherSuite.4=TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA

The ciphers listed under TLS1.1 are the same already listed in the TLS1.2 section so in all I can only use 4 ciphers. But at least now when I retest I get the A rating I was looking for and the external clients can still connect as long as they support at least TLS1.1 - So that really is goodbye to Windows XP and Vista. My next step is to try to see if the larger key size for the key exchanges can be made bigger as I'm currently seeing a warning when doing an `nmap` listing of the ciphers.

    # nmap --script ssl-enum-ciphers -Pn -p443 desktop.domain.tld
    ...
    warnings:
      Key exchange (secp160k1) of lower strength than certificate key
    ...

## References

[http://pubs.vmware.com/horizon-7-view/topic/com.vmware.horizon-view.security.doc/GUID-7FA3EE31-2DFD-4979-A972-87B40695FFC5.html?resultof=%22%6c%6f%63%6b%65%64%2e%70%72%6f%70%65%72%74%69%65%73%22%20](http://pubs.vmware.com/horizon-7-view/topic/com.vmware.horizon-view.security.doc/GUID-7FA3EE31-2DFD-4979-A972-87B40695FFC5.html?resultof=%22%6c%6f%63%6b%65%64%2e%70%72%6f%70%65%72%74%69%65%73%22%20) [http://www.mcculloughjp.com/?p=68](http://www.mcculloughjp.com/?p=68)
