---
pubDatetime: 2017-03-01T08:40:02Z
modDatetime: 2017-03-01T09:00:58Z
title: "Teradici PCOIP MC Upgrade"
tags:
  - "Linux"
description: "Following the upgrade of the Management Console I noticed that none of the terminals were actually connecting to the Management Console."
---
Following the upgrade of the Management Console I noticed that none of the terminals were actually connecting to the Management Console. They connected through our 802.1x onto the production VLAN, but if you look in the console - none of them are reporting back. So I picked one at random that I found that was online (even though the management console says it is, it might not be). I logged into the terminals web GUI and looked at the Management config.

    Management > Config

And then I saw this.

> **Management Status**: Idle - Failed to connect due to a certificate issue

The important part is the certificate fingerprint. This is sent out using DHCP and is the fingerprint that the last Management Console used, which was working. But after a lot of work with certificates recently it didn't look like the fingerprint of the certificate that the server is using for it's web GUI. I confirmed this by looking in the terminals event log `Diagnostics > Event Log` and found this:

    2017-03-01T08:29:03.76Z> LVL:2 RC:   0        MGMT_PEM :Expected Thumbprint:
    74:5E:46:8F:76:E3:E0:F2:0E:67:C2:55:80:BE:2F:76:23:67:1A:08:13:98:96:EC:28:2E:AA:F0:94:0D:D1:23
    2017-03-01T08:29:03.76Z> LVL:2 RC:   0        MGMT_PEM :Actual Thumbprint:
    B7:62:71:01:85:27:46:BB:E3:E9:5C:E2:34:2C:B5:76:7D:7A:F1:7F:6A:4D:5C:DB:AA:2B:99:BD:D5:A9:28:91

Now that's more like it. I recognised the `B7:62...` thumbprint. So what's changed? It looks like the new version of management console is now using the same certificate on the Jetty port 5172 as it does for the web GUI. So I updated the DHCP server option to replace the "`011 EBM X.509 SHA-256 fingerprint`" setting with the `B7:62...` certificate. Then I cleared the management state on the terminal and rebooted it. Now when I look at the terminals web GUI under Management Config I see:

> **Management Status**: Connected to Endpoint Manager: 192.168.0.95:5172

and the terminal is now connected to the Management Console.   References: <https://warlord0blog.wordpress.com/2017/02/23/teradici-pcoip-management-console/>
