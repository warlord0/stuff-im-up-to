---
pubDatetime: 2017-01-27T12:49:38Z
modDatetime: 2017-01-27T12:50:31Z
title: "Blank Dialog when Managing Connection Server"
tags:
  - "horizon"
  - "vmware"
  - "Windows"
heroImage: "/blog-media/2016/10/vmware-logo-eps-vector-image-800x533-e1476948729563.png"
description: "Create file c:\\Program Files\\VMware\\VMware View\\Server\\sslgateway\\conf\\locked.properties with the content: checkOrigin=false References: https://kb.vmware."
---
Create file `c:\Program Files\VMware\VMware View\Server\sslgateway\conf\locked.properties` with the content:

    checkOrigin=false

References: [https://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=2144768](https://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=2144768)
