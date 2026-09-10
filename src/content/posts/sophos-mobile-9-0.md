---
pubDatetime: 2019-02-28T16:03:37Z
title: "Sophos Mobile 9.0"
tags:
  - "Windows"
heroImage: "/blog-media/2017/04/sophos_logo-svg.png"
description: "Today saw me upgrading our Sophos Mobile Control v8 server. Mandatory Upgrade Notice: Sophos Mobile 9.0 Dear Customer, Please be advised that, effective Ap"
---
Today saw me upgrading our Sophos Mobile Control v8 server.

### Mandatory Upgrade Notice: Sophos Mobile 9.0

*Dear Customer,*

*Please be advised that, effective April 2019, management of Android devices will cease to function with versions of Sophos Mobile older than 8.6. All instances of the Sophos Mobile management server should be upgraded to the latest version, 9.0, to ensure continuous management. Read how to easily upgrade to Sophos Mobile 9.0 and find out what’s new.*

#### Why must I upgrade to Sophos Mobile 9.0?

*Sophos Mobile servers (versions older than 8.6) communicate with Android devices under management using Google Cloud Messaging (GCM). As of April 10, 2018, Google has deprecated GCM. The GCM server and client APIs are deprecated and will be removed by Google as soon as April 11, 2019.*

------------------------------------------------------------------------

The upgrade process itself would have been very easy, but we failed the pre-flight checks due to our install being on a Windows 2008 R2 server.

Time to install a new host with Server 2016 and move the install across. The process is documented here: [https://community.sophos.com/kb/en-us/119727](https://community.sophos.com/kb/en-us/119727), but relates to Microsoft SQL. We use MySQL at the minute.

Despite that difference the process was very straight forward.

- On the old host Stop the SMC service.
- Do a MySQL Dump of the SMCDBv2 database from the old host (with create schema).
- Copy the dump file over to the new host.
- Install MariaDB (or MySQL) onto the new host.
- Restore the dump file into MariaDB using:

```
c:> mysql -u root -p < dumpfile.sql
```

- Install the old version of SMC v8 onto the new host.
- During the install confirm you want to upgrade an existing version of MySQL
- Point to the new instance on MySQL, port 3306, schema: SMCv2 using root and the matching password.
- Point to your SSL certificate (.pfx) that you used for your previous SMC install.

When the install finishes it all should start up as expected. Visually the v9 interface isn't significantly different to v8.
