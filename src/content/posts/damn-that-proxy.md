---
pubDatetime: 2018-12-12T09:01:34Z
modDatetime: 2018-12-12T10:47:38Z
title: "Damn that Proxy!"
tags:
  - "proxy"
  - "Web"
description: "In Windows when you run into an application that doesn't use proxy settings and doesn't look at the environmental variable, IE or netsh settings, then you'"
---
In Windows when you run into an application that doesn't use proxy settings and doesn't look at the environmental variable,  IE or netsh settings, then you're kind of stuck when you must send web traffic through a proxy.

That was until we discovered [proxycap](http://www.proxycap.com).

Proxy cap is a very flexible solution that can add specific rules for various requirements. It will then intercept matching traffic and direct it to the proxy without the application even realising there is a proxy.

The example we based this on is the application [Bluestacks](https://www.bluestacks.com/), not being able to proxy. When we Goggled a solution we came up with posts about using proxycap. We could then add in rules only for the programs bluestacks.exe and hd-player.exe using https to be intercepted and Bluestacks would then work - even though it knew nothing about proxies.

Proxycap seems very clever in that it seems to just modify the Windows firewall to make the magic happen. It's very flexible in that you could even set different apps to use different proxies. It also supports authentication.

It's a commercial product, but sometimes you just have to pay the price.
