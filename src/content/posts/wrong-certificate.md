---
pubDatetime: 2017-06-15T09:34:16Z
modDatetime: 2018-01-31T08:04:24Z
title: "Wrong Certificate!"
tags:
  - "Networking"
  - "ssl"
description: "\"Your connection is not private!\" This was a game over message that was the result of installing the wrong type of certificate onto our new printers. We're"
---
# "Your connection is not private!"

This was a game over message that was the result of installing the wrong type of certificate onto our new printers. We're still working on getting the template right, but put simply we enabled a User certificate as the HTTPS management certificate. This caused any browser to throw up a serious security alert, serious enough that it doesn't give you the option to continue to the management interface. Even trying a factory reset on the printer didn't take us back to factory settings for the management interface - that's another bridge we have to cross. Thankfully, within Google Chrome there is a secret instruction that allows us to continue even though we really shouldn't.

> So don't use this carte blanche. It's a get out of jail free card for a specific failure of our own making. If your browser is stopping you from getting to a web site, it's usually doing so for a very good reason.

On the page where you are prevented access click anywhere inside the browser page and type "`badidea`". As if by magic you are now able to visit the page and now we were able to correct our misconfiguration and change the HTTPS certificate back to a valid Web Server type. If you find "`badidea`" doesn't work try using "`danger`" instead.   References: [https://www.quora.com/How-do-you-fix-the-privacy-error-in-Chrome-Your-connection-is-not-private](https://www.quora.com/How-do-you-fix-the-privacy-error-in-Chrome-Your-connection-is-not-private)
