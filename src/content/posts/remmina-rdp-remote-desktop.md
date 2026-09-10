---
pubDatetime: 2016-10-07T11:44:54Z
modDatetime: 2016-10-07T18:49:40Z
title: "Remmina RDP (Remote Desktop)"
tags:
  - "certificates"
  - "Linux"
  - "Windows"
heroImage: "/blog-media/2016/09/debian-logo-1.png"
description: "I've been using Remmina to RDP to my Windows servers for some time and it's been just great. But just recently it started popping up with a fairly bland me"
---
I've been using Remmina to RDP to my Windows servers for some time and it's been just great. But just recently it started popping up with a fairly bland message "**Unable to connect to RDP server MYSERVER**" on a number of my servers. Not all of them, but some of them. After a long session of Googling (which may be why you're here) I found out it's related to our recent CA certificate changes and probably a freerdp-lib or ssl change. After running Remmina from the command line I found the problem was self explanatory.

    connected to myserver:3389
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @           WARNING: CERTIFICATE NAME MISMATCH!           @
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    The hostname used for this connection (myserver) 
    does not match any of the names given in the certificate:
    Common Name (CN):
        no CN found in certificate
    A valid certificate for the wrong name should NOT be trusted!
    tls_connect: certificate not trusted, aborting.
    Error: protocol security negotiation or connection failure
    Gtk-Message: GtkDialog mapped without a transient parent. This is discouraged.

So went about correcting this by updating the servers certificate so it got created with a CN this time. I guess our old template didn't do this, but the new one does. So now the certificate is correct, I tried again.

    connected to myserver:3389
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    @           WARNING: CERTIFICATE NAME MISMATCH!           @
    @@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@@
    The hostname used for this connection (myserver) 
    does not match any of the names given in the certificate:
    Common Name (CN):
        MYSERVER.domain.local
    A valid certificate for the wrong name should NOT be trusted!
    tls_connect: certificate not trusted, aborting.
    Error: protocol security negotiation or connection failure
    Gtk-Message: GtkDialog mapped without a transient parent. This is discouraged.

Turns out the hostname specified in Remmina needs to exactly match the CN returned in the certificate, including case.
