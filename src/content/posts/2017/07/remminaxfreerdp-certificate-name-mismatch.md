---
pubDatetime: 2017-07-21T13:13:16Z
modDatetime: 2017-07-21T13:17:59Z
title: "Remmina/xfreerdp Certificate Name Mismatch"
tags:
  - "certificates"
  - "Linux"
  - "Windows"
heroImage: "/blog-media/2016/09/debian-logo-1.png"
description: "When using Remmina to connect to some of our older Windows systems we're seeing a certificate problem that prevents it from connecting. Remmina pretty much"
---
When using Remmina to connect to some of our older Windows systems we're seeing a certificate problem that prevents it from connecting. Remmina pretty much says you can't connect, but you can see the error message if you run remmina from a terminal and try to connect.

    connected to server:3389
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@           WARNING: CERTIFICATE NAME MISMATCH!           @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    The hostname used for this connection (m3app) does not match any of the names given in the certificate:
    Common Name (CN): no CN found in certificate
    A valid certificate for the wrong name should NOT be trusted!
    tls_connect: certificate not trusted, aborting.
    Error: protocol security negotiation or connection failure

This is often the case with older certificate templates not having a CN. But you'll also see a similar error if the server you are trying to connect to has a CN that is a different case than you are trying to connect to. So watch out for `SERVER.domain.local` instead of `server.domain.local` Now the tricky bit is getting to a remote server to change the certificate that is stopping you from connecting remotely. I got around this by install `freerdp-X11` and using a terminal to connect whilst ignoring the certificate errors.

    $ xfreerdp /v:[SERVER] /u:[USER] /cert-ignore

Then just get into mmc and change the certificate as necessary.
