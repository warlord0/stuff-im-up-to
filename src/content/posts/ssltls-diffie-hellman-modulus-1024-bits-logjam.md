---
pubDatetime: 2017-02-03T11:31:26Z
modDatetime: 2017-02-03T11:58:29Z
title: "SSL/TLS Diffie-Hellman Modulus <= 1024 Bits (Logjam)"
tags:
  - "Security"
  - "ssl"
  - "Windows"
description: "Create and set the following registry key value: HKEY_LOCAL_MACHINE\\SYSTEM\\CurrentControlSet\\Control\\SecurityProviders\\SCHANNEL\\KeyExchangeAlgorithms\\Diffi"
---
Create and set the following registry key value:

    HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\KeyExchangeAlgorithms\Diffie-Hellman
    "ServerMinKeyBitLength"=dword:00000800

Hex value 800 = 2048 References: [https://technet.microsoft.com/en-us/library/security/3174644.aspx](https://technet.microsoft.com/en-us/library/security/3174644.aspx)
