---
pubDatetime: 2016-10-05T13:18:39Z
modDatetime: 2016-10-05T13:21:53Z
title: "Windows Proxy Settings"
tags:
  - "proxy"
  - "Windows"
description: "Set the Server to use the proxy at the command line using: C:\\> netsh winhttp set proxy \"http://myproxy:3128\" \"<local>\" Where the <local> parameter means s"
---
Set the Server to use the proxy at the command line using:

    C:\> netsh winhttp set proxy "http://myproxy:3128" "<local>"

Where the \<local\> parameter means skip using a proxy for local addresses. View your setting using:

    C:\> netsh winhttp show proxy

Syntax:

    set proxy [proxy-server=] ProxyServerName [bypass-list=] <HostsList>
