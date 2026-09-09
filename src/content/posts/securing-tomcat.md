---
pubDatetime: 2017-01-31T08:11:43Z
modDatetime: 2017-01-31T08:21:00Z
title: "Securing Tomcat"
tags:
  - "java"
  - "Web"
description: "NEVER trust a vendor installation to be secure. Carry out a vulnerability scan whilst they're still onsite and don't sign off any installation until all security concerns have been resolved."
---
Following a penetration test a large security weakness was exploited that allowed an attacker to gain local admin rights on a server running Tomcat. This in turn allowed the capture of session passwords from memory which in turn resulted in domain admin level access. All because of a 3rd party application installed by a vendor who left the underlying Tomcat installation as a vanilla box product with all the softwares default settings.

> **Lesson**: NEVER trust a vendor installation to be secure. Carry out a vulnerability scan whilst they're still onsite and don't sign off any installation until all security concerns have been resolved.

References: [http://tomcat.apache.org/tomcat-7.0-doc/security-howto.html](http://tomcat.apache.org/tomcat-7.0-doc/security-howto.html) [https://www.owasp.org/index.php/Securing_tomcat](https://www.owasp.org/index.php/Securing_tomcat) [https://tomcat.apache.org/tomcat-8.0-doc/security-howto.html](https://tomcat.apache.org/tomcat-8.0-doc/security-howto.html) [https://tomcat.apache.org/tomcat-8.0-doc/ssl-howto.html](https://tomcat.apache.org/tomcat-8.0-doc/ssl-howto.html) [https://www.upguard.com/articles/15-ways-to-secure-apache-tomcat-8](https://www.upguard.com/articles/15-ways-to-secure-apache-tomcat-8)
