---
pubDatetime: 2019-05-01T08:04:40Z
title: "MSSQL ACCEPT_EULA"
tags:
  - "Linux"
  - "mssql"
heroImage: "/blog-media/2016/10/mssql_logo.png"
description: "My automated apt updates failed to update the Microsoft SQL components because they don't accept the terms and condition in the EULA. To resolve this I add"
---
My automated apt updates failed to update the Microsoft SQL components because they don't accept the terms and condition in the EULA.

To resolve this I added the following line in `/etc/environment` that allows the EULA to be accepted by default.

```
ACCEPT_EULA=Y
```
