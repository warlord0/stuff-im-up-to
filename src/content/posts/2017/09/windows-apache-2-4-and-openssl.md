---
pubDatetime: 2017-09-22T10:53:15Z
title: "Windows, Apache 2.4 and OpenSSL"
tags:
  - "apache"
  - "Security"
  - "ssl"
  - "Web"
  - "Windows"
heroImage: "/blog-media/2017/09/asf_logo.png"
description: "In order to make Apache 2.4.27 compliant it needs the later version of OpenSSL v1.1.0. To get this you need to install the VC15 version. The VC11 etc. do not include the later OpenSSL and fail because they are compiled with v1.0.2"
---
In order to make Apache 2.4.27 compliant it needs the later version of OpenSSL v1.1.0. To get this you need to install the VC15 version. The VC11 etc. do not include the later OpenSSL and fail because they are compiled with v1.0.2

```
  Banner           : Apache/2.4.27 (Win64) OpenSSL/1.0.2l
  Reported version : 1.0.2l
  Fixed version    : 1.1.0
```

This is detailed in the 16 June 2017 change log, but is repeated here as a reminder to install vcredist_x64 for VC++ 2017 which is linked on the downloads page on Apache Lounge.

## References

[https://www.apachelounge.com/download/](https://www.apachelounge.com/download/) [https://www.apachelounge.com/Changelog-2.4.html](https://www.apachelounge.com/Changelog-2.4.html)
