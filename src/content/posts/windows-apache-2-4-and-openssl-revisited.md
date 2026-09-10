---
pubDatetime: 2019-06-07T10:06:56Z
title: "Windows, Apache 2.4 and OpenSSL (Revisited)"
tags:
  - "apache"
  - "Web"
  - "Windows"
heroImage: "/blog-media/2017/09/asf_logo.png"
description: "Following on from Windows, Apache 2.4 and OpenSSL our vulnerability scanner has picked up that although the version of Apache httpd 2.4.39 has not vulnerab"
---
Following on from [Windows, Apache 2.4 and OpenSSL](https://warlord0blog.wordpress.com/2017/09/22/windows-apache-2-4-and-openssl/) our vulnerability scanner has picked up that although the version of Apache httpd 2.4.39 has not vulnerabilities, the included version of OpenSSL 1.1.1b needs to be upgraded to 1.1.1c.

> So how do we do that when we are not building or compiling the Windows binary version ourselves?

Looking at Apache Lounge the current version of httpd is 2.4.39 with VC15 - which is what we're using. Looking further afield I found that [Apache Haus](https://www.apachehaus.com/cgi-bin/download.plx) have compiled 2.4.39 with OpenSSL 1.1.1c. So I have to make a change where I get my binary from.

> Apache 2.4.39 with **OpenSSL 1.1.1c**, brotli 1.0.7, nghttp 1.38.0, Zlib 1.2.10, PCRE 8.43, APR 1.7.0, APR-Util 1.6.1

### References

[https://www.apachehaus.com/cgi-bin/download.plx](https://www.apachehaus.com/cgi-bin/download.plx)
