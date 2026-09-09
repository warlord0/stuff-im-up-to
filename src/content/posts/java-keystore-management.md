---
pubDatetime: 2017-11-14T11:41:44Z
modDatetime: 2017-11-14T11:44:06Z
title: "Java Keystore Management"
tags:
  - "java"
  - "Linux"
  - "Security"
  - "Windows"
description: "In the process of getting a new queue management system installed I discovered they're using HTTP and not HTTPS. As part of out security process I had to r"
---
![keystore20explorer_256x256](/blog-media/2017/11/keystore20explorer_256x256.png)In the process of getting a new queue management system installed I discovered they're using HTTP and not HTTPS. As part of out security process I had to recommend they change this to a HTTPS/SSL encrypted portal as it uses a logon process that would otherwise be in clear text. The product is based on Wildfly and Java so they are progressing the deployment use Java keystores (JKS) and certificates. But as they pointed me to their installation guide I discovered they recommend the use of [Keystore Explorer](http://keystore-explorer.org/) for managing the Java certificates. So I downloaded it and have to say I'm impressed. It makes life so much easier when trying to manage certificates from Windows CA's, OpenSSL and JKS. Definitely a valuable addition to my tool box. As it's written in Java it's available for Windows, Linux and fruit based systems. Link: [http://keystore-explorer.org/](http://keystore-explorer.org/)
