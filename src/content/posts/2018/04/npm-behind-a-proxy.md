---
pubDatetime: 2018-04-13T09:29:31Z
modDatetime: 2018-04-13T09:30:33Z
title: "NPM Behind a Proxy"
tags:
  - "JavaScript"
  - "node.js"
  - "proxy"
heroImage: "/blog-media/2016/11/images-duckduckgo-com-e1479333489433.png"
description: "Whilst trying to deploy a Node.js script to one of our windows servers I realised that NPM wasn't downloading the necessary components because it wasn't ev"
---
Whilst trying to deploy a Node.js script to one of our windows servers I realised that NPM wasn't downloading the necessary components because it wasn't even trying to use the corporate proxy server. It's a Windows server so I checked the proxy settings

    c:> netsh winhttp show proxy

    Current WinHTTP proxy settings:

        Proxy Server(s) : http://192.168.0.117:8080
        Bypass List : <local>

That seemed to be telling the OS to use the corporate proxy. But the NPM progress bar just remained frozen and no modules were downloaded. NPM has it's own proxy settings in your user profile `.npmrc` file. You can edit the file and add them in yourself:

    proxy=http://192.168.0.117:8080/
    https-proxy=http://192.168.0.117:8080

or at the command prompt:

    c:> npm config set proxy http://<username>:<password>@<proxy-server-url>:<port>
    c:> npm config set https-proxy http://<username>:<password>@<proxy-server-url>:<port>
