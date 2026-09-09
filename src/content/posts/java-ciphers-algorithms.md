---
pubDatetime: 2017-02-02T12:28:32Z
modDatetime: 2017-02-02T12:30:13Z
title: "Java Ciphers & Algorithms"
tags:
  - "Security"
  - "Web"
description: "I've tasked myself with getting one of our most used vendor apps up to compliance with our security audits. It's not as easy as I'd hoped. Especially seein"
---
I've tasked myself with getting one of our most used vendor apps up to compliance with our security audits. It's not as easy as I'd hoped. Especially seeing as I seem to have run beyond the encryption export limitations Java distribute. One of the products uses JDBC to connect to a Microsoft SQL server which is hardened and only supports a limited set of high grade encryption ciphers. This caused me to see connection failures with exception messages such as "failed to generate DH keypair" and "RSA premaster secret error". Then I discovered the Bouncy Castle. As Java security providers seem to have limitations in regard to key sizes I had to add another security provider that is documented here: [https://docs.oracle.com/cd/E29585_01/PlatformServices.61x/security/src/tsec_ssl_bouncy_castle.html](https://docs.oracle.com/cd/E29585_01/PlatformServices.61x/security/src/tsec_ssl_bouncy_castle.html) In order to enable this feature I added the “BouncyCastle” JCE by:

1.  Downloading the Bouncy Castle JCE from <https://www.bouncycastle.org/latest_releases.html>
2.  Copy the downloaded .jar file to `%JAVA_HOME%\lib\ext`
3.  Edit the `%JAVA_HOME%\lib\security\java.security` file and add the following line into the list of providers replacing 11 with whatever the last number in the existing list:

&nbsp;

    security.provider.11=org.bouncycastle.jce.provider.BouncyCastleProvider

As I encountered Bouncy Castle I also came across Java policy files that unrestrict what algorithms can be used (it does not add the ciphers, just unrestricts their use if you have them). I'm unsure if these policy files are necessary in my instance, but I installed them never the less. Download here: <http://www.oracle.com/technetwork/java/javase/downloads/jce8-download-2133166.html> It's a very simple install. Simply download and extract the files. Copy the .jar files to `%JAVA_HOME%/lib/security` overwriting the existing files. Now I can successfully connect to the SQL server.

> **Note**: You may have to add the CA certificate to your Java -trustcacerts that matches your SQL servers certificate signing CA.
