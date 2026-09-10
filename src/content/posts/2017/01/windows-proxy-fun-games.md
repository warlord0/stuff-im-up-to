---
pubDatetime: 2017-01-20T10:05:56Z
modDatetime: 2017-01-20T10:37:01Z
title: "Windows Proxy Fun & Games"
tags:
  - "proxy"
  - "Windows"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "We replaced one of our old 2008 domain controllers with 2012 a few weeks ago. Today we found some odd behaviour in trying to access the internet from the n"
---
We replaced one of our old 2008 domain controllers with 2012 a few weeks ago. Today we found some odd behaviour in trying to access the internet from the new DC. It seemed that sometimes it worked, sometimes it didn't. For one user (logged on locally) it worked for another it wouldn't. After some head scratching it turned out we'd fallen over the "**GlobalQueryBlockList**" We use WPAD for our proxy settings almost exclusively on the network. All clients and many servers simply download the http://wpad/wpad.dat script and that tells the browser which one of our proxies to use for the request that's made. By default the global query blocklist denies DNS queries for wpad. So when I pinged wpad from the command line:

    C:\> ping wpad
    Ping request could not find host wpad. Please check the name and try again.

If I followed up with an nslookup:

    C:\> nslookup wpad

    Server: UnKnown
    Address: 192.168.0.55

    Name: wpad.domain.local
    Address: 192.168.0.55

So nslookup was resolving! So what's going on? After a bit more poking around we found it was resolving on only one of our DNS servers. The other didn't resolve (`Non-existent domain`), despite wpad clearly appearing in the DNS forward lookup zone. So after looking in the registry on the DNS server that wasn't responding I found wpad listed in the key:

     HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\DNS\Parameters\GlobalQueryBlockList

This causes DNS not to reply to queries for the names listed in here. So a quick edit and removal of the wpad entry followed by a restart of the DNS service and now we get proper responses from both DNS servers.
