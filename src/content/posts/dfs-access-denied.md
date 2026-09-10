---
pubDatetime: 2018-01-05T09:49:26Z
title: "DFS - Access Denied"
tags:
  - "dfs"
  - "Windows"
heroImage: "/blog-media/2016/09/windows-server-2012-1024x196.png"
description: "Access Denied - obviously some kind of permission issue, but try as we might comparing ACL's between systems we couldn't see where the issue was."
---
Whilst trying to add a new cluster for file shares to take over from the previous one we found that whilst replication worked to migrate the files, we could not remove or disable the old paths from the Folder Targets. **Access Denied** - obviously some kind of permission issue, but try as we might comparing ACL's between systems we couldn't see where the issue was.

> It all came down to the power of my Google Fu.

The first screenshot on the page I turned up was a 100% clue that this was where I'd find my answer. ![dfs-access-is-denied-namespace-server](/blog-media/2018/01/dfs-access-is-denied-namespace-server.png) [https://www.briantist.com/errors/dfs-properties-cannot-be-set-namespace-server-access-denied/](https://www.briantist.com/errors/dfs-properties-cannot-be-set-namespace-server-access-denied/) For us the easy fix was to use ADSI Edit, expand the tree out to:

    Default Naming Context
    + DC=domain, DC=local
    +- CN=System
    +-- CN=Dfs-Configuration

Then on my share `CN=shares` when I looked at the attribute for `remoteServerName` I could see both of my namespace servers. But when I checked the Security tab,  in the list of permissions only one of the servers was listed. The fix was to add the missing server and ensure it had the `Read all properties` and `Write all properties` permission. We didn't have to restart anything at all. The Domain Replication period was obviously short enough that we were able to see it work within a minute of the change being made.
