---
pubDatetime: 2017-01-25T14:17:51Z
title: "SMC & JBoss Cipher Suites"
tags:
  - "Security"
  - "Windows"
description: "Disabling weak cipher suites in Sophos Mobile Control"
---
Disabling weak cipher suites in Sophos Mobile Control Edit `Sophos Mobile Control\proxy\config.xml` Remove any 128bit cipher from the list that ends with SHA eg.

    TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA

    TLS_RSA_WITH_AES_128_CBC_SHA

    TLS_DHE_RSA_WITH_AES_128_CBC_SHA

  References: [https://community.sophos.com/kb/en-us/121427](https://community.sophos.com/kb/en-us/121427)
