---
pubDatetime: 2016-10-07T13:33:58Z
modDatetime: 2016-10-07T18:22:46Z
title: "IIS & Multiple HTTPS Bindings"
tags:
  - "certificates"
  - "ssl"
  - "Windows"
description: "I'm beginning to think this is going to be a blog about SSL certificates as most of the articles seem that way inclined just now! When it comes to IIS serv"
---
I'm beginning to think this is going to be a blog about SSL certificates as most of the articles seem that way inclined just now! When it comes to IIS serving a single web site over HTTPS it's pretty straight forward. Select bindings and add a new one for HTTPS. You should notice that at this stage you can't enter in a host name as that field becomes greyed out when you choose HTTPS. This is the crux of our problem. You want to run another HTTPS site on port 443, but can't. Well you may not be able to do this from the GUI, but you can from the command line using an admin script. First you need to know what ID each of the servers are. By that I mean W3SVC1, w3SVC2 etc. I tend to find this by looking in the log files in c:\inetpub\logs. I'm sure there's an easier way. There is one major caveat here. You can only use one SSL certificate that will be common across both HTTPS servers. Which is ok if you're using as an internal system with DNS aliases, but externally your certificate would have to have Subject Alternative Names (SAN's) that present both the names of the web sites. Then from a command line for each server:

    C:\> cscript.exe C:\Inetpub\AdminScripts\adsutil.vbs set /w3svc/1/SecureBindings ":443:myserver1.domain.local"
    C:\> cscript.exe C:\Inetpub\AdminScripts\adsutil.vbs set /w3svc/2/SecureBindings ":443:myserver2.domain.local"

Where you would replace the 1 & 2 with the ID of the server matching the name you require. The reason we got caught with this again is we just changed our server certificate which caused us to have to redo the bindings as above. Further reading: [https://blogs.msdn.microsoft.com/varunm/2013/06/18/bind-multiple-sites-on-same-ip-address-and-port-in-ssl/](https://blogs.msdn.microsoft.com/varunm/2013/06/18/bind-multiple-sites-on-same-ip-address-and-port-in-ssl/)
