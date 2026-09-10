---
pubDatetime: 2017-01-30T13:45:09Z
modDatetime: 2017-03-01T14:20:49Z
title: "Java SSL/TLS Ciphers"
tags:
  - "java"
  - "Linux"
  - "ssl"
  - "Windows"
heroImage: "/blog-media/2017/01/java-logo-png-e1485773197141.png"
description: "You can specify what cipher suites Java uses by editing the file: %JAVA_HOME%\\lib\\security\\java.security This file must also be used by the Java applicatio"
---
You can specify what cipher suites Java uses by editing the file:

    %JAVA_HOME%\lib\security\java.security

This file must also be used by the Java application. So if the application overrides this by using a `-Djava.security.properties=<URL>` setting then you should modify the file specified by `<URL>`. The ciphers to disable are listed in the following keys:

    jdk.certpath.disabledAlgorithms

    jdk.tls.disabledAlgorithms

The file is documented, so you should be able to figure out the required settings from the examples. The `jdk.tls.disabledAlgorithms` property in the policy file controls TLS cipher selection. The `jdk.certpath.disabledAlgorithms` controls the algorithms you will come across in SSL certificates. Oracle has more information about this [here](http://docs.oracle.com/javase/7/docs/technotes/guides/security/jsse/JSSERefGuide.html#DisabledAlgorithms).

### Debugging

One invaluable bit of information I found was to turn on debugging so I could see what's going on with the Java SSL process. This is achieved by adding the configuration option -Djavax.net.debug=all into the config of the application you are running. This could be anywhere, but by way of example, when using openjms as a wrapper I added it into the openjms-wrapper.conf file into the Java Additional Parameters section eg.

    # Java Additional Parameters
    wrapper.java.additional.1=-Djava.ext.dirs=C:/openjms/lib
    wrapper.java.additional.2=-Dopenjms.home=C:/openjms
    wrapper.java.additional.3=-Djava.security.policy=C:/openjms/config/openjms.policy
    wrapper.java.additional.4=-Djava.security.manager
    wrapper.java.additional.5=-Djavax.net.debug=all

This creates a wealth of feedback into your log file as per the snippet below. At some later date I'll have to have a go through the list and only allow ciphers I actually want. But I can at least see what isn't working now.

    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_DHE_DSS_WITH_AES_256_GCM_SHA384
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_RSA_WITH_AES_256_CBC_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_DHE_DSS_WITH_AES_128_GCM_SHA256
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_DHE_RSA_WITH_AES_256_GCM_SHA384
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_DHE_RSA_WITH_AES_128_GCM_SHA256
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_ECDSA_WITH_AES_256_GCM_SHA384
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_RSA_WITH_AES_256_CBC_SHA256
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_RSA_WITH_3DES_EDE_CBC_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_ECDSA_WITH_AES_128_GCM_SHA256
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_DHE_DSS_WITH_AES_256_CBC_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_ECDSA_WITH_RC4_128_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_RSA_WITH_AES_128_CBC_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_ECDSA_WITH_AES_128_GCM_SHA256
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_ECDSA_WITH_3DES_EDE_CBC_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_ECDSA_WITH_AES_256_GCM_SHA384
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_RSA_WITH_AES_256_CBC_SHA384
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_RSA_WITH_AES_128_GCM_SHA256
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_RSA_WITH_AES_128_CBC_SHA256
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_RSA_WITH_AES_256_GCM_SHA384
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_ECDSA_WITH_AES_256_CBC_SHA384
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_ECDSA_WITH_AES_128_CBC_SHA256
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_RSA_WITH_AES_256_CBC_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_ECDSA_WITH_RC4_128_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_RSA_WITH_3DES_EDE_CBC_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_RSA_WITH_AES_256_GCM_SHA384
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_ECDSA_WITH_3DES_EDE_CBC_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_RSA_WITH_AES_128_GCM_SHA256
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDH_RSA_WITH_RC4_128_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA384
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_RSA_WITH_RC4_128_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_DHE_RSA_WITH_AES_256_CBC_SHA256
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_ECDSA_WITH_AES_256_CBC_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_DHE_DSS_WITH_AES_256_CBC_SHA256
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_ECDSA_WITH_AES_128_CBC_SHA256
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_DHE_RSA_WITH_AES_256_CBC_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unavailable cipher suite: TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384
    INFO | jvm 1 | 2017/01/30 11:48:22 | Allow unsafe renegotiation: false
    INFO | jvm 1 | 2017/01/30 11:48:22 | Allow legacy hello messages: true
    INFO | jvm 1 | 2017/01/30 11:48:22 | Is initial handshake: true
    INFO | jvm 1 | 2017/01/30 11:48:22 | Is secure renegotiation: false
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unsupported cipher suite: TLS_RSA_WITH_AES_128_CBC_SHA256 for SSLv3
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unsupported cipher suite: TLS_DHE_RSA_WITH_AES_128_CBC_SHA256 for SSLv3
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unsupported cipher suite: TLS_DHE_DSS_WITH_AES_128_CBC_SHA256 for SSLv3
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unsupported cipher suite: TLS_RSA_WITH_AES_128_CBC_SHA256 for TLSv1
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unsupported cipher suite: TLS_DHE_RSA_WITH_AES_128_CBC_SHA256 for TLSv1
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unsupported cipher suite: TLS_DHE_DSS_WITH_AES_128_CBC_SHA256 for TLSv1
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unsupported cipher suite: TLS_RSA_WITH_AES_128_CBC_SHA256 for TLSv1.1
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unsupported cipher suite: TLS_DHE_RSA_WITH_AES_128_CBC_SHA256 for TLSv1.1
    INFO | jvm 1 | 2017/01/30 11:48:22 | Ignoring unsupported cipher suite: TLS_DHE_DSS_WITH_AES_128_CBC_SHA256 for TLSv1.1
    INFO | jvm 1 | 2017/01/30 11:48:22 | %% No cached client session
    INFO | jvm 1 | 2017/01/30 11:48:22 | *** ClientHello, TLSv1.2
    INFO | jvm 1 | 2017/01/30 11:48:22 | RandomCookie: GMT: 1468999686 bytes = { 78, 201, 142, 145, 187, 169, 68, 190, 164, 26, 243, 169, 234, 208, 209, 131, 103, 192, 249, 102, 57, 69, 68, 152, 208, 40, 177, 143 }
    INFO | jvm 1 | 2017/01/30 11:48:22 | Session ID: {}
    INFO | jvm 1 | 2017/01/30 11:48:22 | Cipher Suites: [TLS_RSA_WITH_AES_128_CBC_SHA256, TLS_DHE_RSA_WITH_AES_128_CBC_SHA256, TLS_DHE_DSS_WITH_AES_128_CBC_SHA256, TLS_RSA_WITH_AES_128_CBC_SHA, TLS_DHE_RSA_WITH_AES_128_CBC_SHA, TLS_DHE_DSS_WITH_AES_128_CBC_SHA, SSL_RSA_WITH_3DES_EDE_CBC_SHA, SSL_DHE_RSA_WITH_3DES_EDE_CBC_SHA, SSL_DHE_DSS_WITH_3DES_EDE_CBC_SHA, SSL_RSA_WITH_RC4_128_SHA, TLS_EMPTY_RENEGOTIATION_INFO_SCSV]
    INFO | jvm 1 | 2017/01/30 11:48:22 | Compression Methods: { 0 }
    INFO | jvm 1 | 2017/01/30 11:48:22 | Extension signature_algorithms, signature_algorithms: SHA512withECDSA, SHA512withRSA, SHA384withECDSA, SHA384withRSA, SHA256withECDSA, SHA256withRSA, SHA224withECDSA, SHA224withRSA, SHA1withECDSA, SHA1withRSA, SHA1withDSA
    INFO | jvm 1 | 2017/01/30 11:48:22 | ***
