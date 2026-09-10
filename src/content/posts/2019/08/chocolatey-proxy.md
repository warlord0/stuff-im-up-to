---
pubDatetime: 2019-08-12T08:50:09Z
title: "Chocolatey Proxy"
tags:
  - "Windows"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "I was tidying up another PC today and came across an annoying issue that I couldn't resolve. It took me a while, reinstalling, uninstalling choco etc. and"
---
I was tidying up another PC today and came across an annoying issue that I couldn't resolve. It took me a while, reinstalling, uninstalling choco etc. and still not getting to the bottom of it.

When I ran `choco` from the PowerShell command line I got asked for my proxy credentials and I could use the CLI. But every time I started Chocolatey GUI I'd get an error:

```
System.InvalidOperationException: Cannot read keys when either application does not have a console or when console input has been redirected from a file.
```

I had a light bulb moment in that this meant the GUI was waiting for an input of my user name and password to get through the proxy.

The solution was to use the CLI to set the proxy and credentials.

```
choco config set proxy 
choco config set proxyUser  #optional
choco config set proxyPassword  # optional
```

The the GUI fires up and I can update and install apps.

References: <https://warlord0blog.wordpress.com/2019/02/27/chocolatey-package-manager/>
