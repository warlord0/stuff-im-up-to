---
pubDatetime: 2016-10-18T12:51:23Z
title: "RDP Server Certificate"
tags:
  - "certificates"
  - "Windows"
heroImage: "/blog-media/2016/09/windows-server-2012-1024x196.png"
description: "With Windows Server 2012 it seems they've decided to do away with the GUI for managing the RDP admin connection unless you install the full RDS product. So"
---
With Windows Server 2012 it seems they've decided to do away with the GUI for managing the RDP admin connection unless you install the full RDS product. So when you get a new certificate for the server you need to update the RDP service somehow. By far the easiest way is to use the tsconfig.msc (Remote Desktop Session Host Configuration) GUI from an old 2008 server and connect to the new 2012 system to change the certificate. But sometimes there's no choice other than command line. For this you'll need to get the thumbprint of the certificate you want to use from the Local Computer certificate store (using mmc). Then fire up a powershell CLI "as administrator" and make the change using a WMI command:

    C:\> wmic /namespace:\\root\cimv2\TerminalServices PATH Win32_TSGeneralSetting Set SSLCertificateSHA1Hash="[thumbprint]"

Where the thumbprint is a continuous string with no spaces. End your RDP session and reconnect and you should now have a new certificate protecting your session.
