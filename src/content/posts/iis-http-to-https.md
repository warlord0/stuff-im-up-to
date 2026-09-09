---
pubDatetime: 2017-03-01T14:16:08Z
modDatetime: 2017-03-01T14:19:49Z
title: "IIS HTTP to HTTPS"
tags:
  - "ssl"
  - "Web"
  - "Windows"
description: "In the process of deploying an IIS web server we'd like to ensure that browsers that visit the http unencrypted page, get redirected to the https encrypted"
---
In the process of deploying an IIS web server we'd like to ensure that browsers that visit the http unencrypted page, get redirected to the https encrypted page. By default IIS comes with a "HTTP Redirect" module but this doesn't really do what we're after. HTTP Redirect simply takes any request and forwards it to a specific URL. So it doesn't care about the original host name header, URI or query string that was supplied by the browser, it just takes you to the exact URL that you specify. To get the behaviour we're expecting we need to install another module called "URL Rewrite" URL Rewrite Available here: [https://www.iis.net/downloads/microsoft/url-rewrite](https://www.iis.net/downloads/microsoft/url-rewrite) You can also install it from the "Web Platform Installer" if you chose. Once installed close the IIS manager and reopen and you'll see a "URL Rewrite" module under IIS" for your Site. Using this rule it enables us to detect if https is used, if not redirect the request to the https using the same host name, URI and query string as supplied by the browser.

## Open URL Rewrite

#### Add a blank rule

### In Match URL

Set "Requested URL" to "Matches the Pattern" Using "Wildcard" Set "Pattern" to just an asterisk "\*" and tick "ignore case"

### In the Conditions

#### Add a Condition

Set "Condition input" to "{HTTPS}" Check if input string "Matches the Pattern" Set Pattern to "off" and tick "ignore case"

### Under Action

Set Action type to "Redirect" *Set Redirect URL to "https://{HTTP_HOST}{REQUEST_URI}"* Tick "Append query string" Set Redirect Type to "Found (302)"   References: [https://blogs.technet.microsoft.com/dawiese/2016/06/07/redirect-from-http-to-https-using-the-iis-url-rewrite-module/](https://blogs.technet.microsoft.com/dawiese/2016/06/07/redirect-from-http-to-https-using-the-iis-url-rewrite-module/)
