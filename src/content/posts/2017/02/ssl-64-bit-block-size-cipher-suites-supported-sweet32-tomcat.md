---
pubDatetime: 2017-02-03T08:52:13Z
modDatetime: 2017-02-03T08:58:25Z
title: "SSL 64-bit Block Size Cipher Suites Supported (SWEET32) - Tomcat"
tags:
  - "Security"
  - "ssl"
  - "tomcat"
  - "Web"
heroImage: "/blog-media/2017/01/2000px-tomcat-logo-svg-e1485850229861.png"
description: "Following on from the Windows vulnerability for SWEET32, Here's how to resolve the same issue with Tomcat 8. This use the OpenSSL format string for ciphers"
---
Following on from the Windows vulnerability for SWEET32, Here's how to resolve the same issue with Tomcat 8. This use the OpenSSL format string for ciphers, so can also be applied to anything using the same cipher list.

    ciphers="HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!kRSA:!ECDHE-RSA-DES-CBC3-SHA"

Simply by adding the `!ECDHE-RSA-DES-CBC3-SHA` to your existing `:` delimited cipher list disables the cipher on the server. The prefix `!` means NOT - which disables the cipher. Alternatively you can simply disable all ciphers using triple DES using `!3DES`. When you encounter some other cipher vulnerability listed in you Nessus scan just copy the cipher name into the list prefixed with `!`. Be wary that some of your connecting applications may not like this. So keep a log of what you added so you can rollback.

> To use the AES 256 bit ciphers, it is necessary to install the JCE Unlimited Strength Jurisdiction Policy Files.
