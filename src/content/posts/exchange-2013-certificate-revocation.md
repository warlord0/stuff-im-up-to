---
pubDatetime: 2018-05-30T14:35:44Z
title: "Exchange 2013 - Certificate Revocation"
tags:
  - "exchange"
  - "Windows"
heroImage: "/blog-media/2016/09/windows-server-2012-1024x196.png"
description: "Using the Exchange Control Panel showed that the certificate being used whilst not expired and valid could not pass a revocation check. I figured this woul"
---
Using the Exchange Control Panel showed that the certificate being used whilst not expired and valid could not pass a revocation check. I figured this would be because the server couldn't get out on the internet to read the necessary CRL. But it wasn't even trying to get online according to our corporate proxy logs. The netsh proxy settings were correct, but obviously something wasn't proxy aware. The resolution goes back to a 2010 hack that calls Internet Explorer as the Local System account. Only thing is, this didn't work on Windows 2012. It did however give me the necessary light bulb moment to resolve it. [http://blogs.technet.com/b/bshukla/archive/2012/04/30/certificate-revocation-checked-failed.aspx](http://blogs.technet.com/b/bshukla/archive/2012/04/30/certificate-revocation-checked-failed.aspx) By using the Sysinternals PsExec to launch a command prompt as the local system I could then run Iexplorer.exe and set the proxy for the Local System account. [https://specopssoft.com/blog/how-to-become-the-local-system-account-with-psexec/](https://specopssoft.com/blog/how-to-become-the-local-system-account-with-psexec/)

    C:\> psexec -s -i cmd.exe

and up pops a new cmd window that runs as Local System. Now call Iexplorer.exe in that new cmd window.

    C:\> "C:\Program Files (x86)\Internet Explorer\iexplorer.exe"

and up pops IE for you to set the proxy as necessary. Give it 15 minutes or so and go back to check the Certificate status and now it shows as "Valid" - Job done!
