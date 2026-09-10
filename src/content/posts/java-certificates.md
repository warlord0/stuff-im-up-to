---
pubDatetime: 2017-01-30T10:58:59Z
modDatetime: 2017-03-01T14:21:13Z
title: "Java Certificates"
tags:
  - "certificates"
  - "java"
  - "Linux"
  - "Windows"
heroImage: "/blog-media/2017/01/java-logo-png-e1485773197141.png"
description: "Certificates are the bane of my existence! After applying some updated certificates to Windows servers some of the systems are now failing to connect to da"
---
Certificates are the bane of my existence! After applying some updated certificates to Windows servers some of the systems are now failing to connect to database servers. This is due to the underlying Java program not knowing about the Windows certificate stores and using their own. Now if life weren't difficult enough the default keystores used by Java reside in their `%JAVA_HOME%\lib\security` folder, but we've got applications that have many flavours of Java installed. ie. java_jre_32bit, java_jre_64bit, java_jdk_32bit and java_jdk_64bit. I know, I didn't install it like this, it's a vendor install and they insist on it being this way and it must remain as a very specific version of Java. So now we have to add the CA certificate into he `cacerts` file, which is where Java keeps its CA certs. So I've had to do this for each flavour of Java by using:

    c:\> %JAVA_HOME%\bin\keytool -v -import -alias MyCA -file MyCA.pem -keystore %JAVA_HOME%\lib\security\cacert

Where MyCA is the name of the certificate and the .pem is a .cer file you must export from your CA's mmc computer certificate snap in (management console).

> Keytool will ask you for a password. What could it be? Well after a major trawl of the internet I found the default Java cacert password is '**changeit**'.

I'm sure you can change it to whatever you'd like, but then you're going to have to ensure that you update your Java configs to give it the new password. Which for me could be problematic as the vendors configs could be anywhere! References: [https://www.sslshopper.com/article-most-common-java-keytool-keystore-commands.html](https://www.sslshopper.com/article-most-common-java-keytool-keystore-commands.html)
