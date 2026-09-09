---
pubDatetime: 2017-08-09T11:14:45Z
modDatetime: 2017-08-09T11:16:32Z
title: "Windows Update KB4034681 (August Monthly Rollup)"
tags:
  - "nps"
  - "Security"
  - "Windows"
description: "Four hours of swearing at servers, kicking switches and rebooting printers and terminals and all because of a Windows Update. Our entire network uses 802.1"
---
Four hours of swearing at servers, kicking switches and rebooting printers and terminals and all because of a Windows Update. Our entire network uses 802.1X authentication with certificates and this morning I arrived in the office to find all the Teradici terminals and network printers were failing to authenticate properly. We hadn't changed anything in the NPS policies so has a certificate expired? The errors in the event logs were constant

> **Event ID 36887** - A fatal alert was received from the remote endpoint. The TLS protocol defined fatal alert code is 42.

And seeing things like:

    Network Policy Server denied access to a user.

    Contact the Network Policy Server administrator for more information.

    User:
        Security ID:            DOMAIN\TERADICI
        Account Name:           teradici@domain.local
        Account Domain:         DOMAIN
        Fully Qualified Account Name:   domain.local/Users/TERADICI

    Client Machine:
        Security ID:            NULL SID
        Account Name:           -
        Fully Qualified Account Name:   -
        OS-Version:         -
        Called Station Identifier:      -
        Calling Station Identifier:     5C-F6-DC-11-77-EE

    NAS:
        NAS IPv4 Address:       192.168.11.253
        NAS IPv6 Address:       -
        NAS Identifier:         -
        NAS Port-Type:          Ethernet
        NAS Port:           1026

    RADIUS Client:
        Client Friendly Name:       WORKS Switch-1
        Client IP Address:          192.168.11.253

    Authentication Details:
        Connection Request Policy Name: 802.1x Wired Proxy
        Network Policy Name:        Teradici
        Authentication Provider:        Windows
        Authentication Server:      DC1.domain.local
        Authentication Type:        EAP
        EAP Type:           Microsoft: Smart Card or other certificate
        Account Session Identifier:     -
        Logging Results:            Accounting information was written to the local log file.
        Reason Code:            16
        Reason:             Authentication failed due to a user credentials mismatch. Either the user name provided does not map to an existing user account or the password was incorrect.

Now because the event log filled up with 1,000's of SChannel errors it only went back to 9:00am as it had rolled off the older messages. So looking at the IAS log files I discovered the problem started at around 3:47am. A look at the event viewer Setup log I noticed that 3 Windows Updates had been applied. Amongst them KB4034681 - which after a Goggle returned the article that states:

> **Know Issues in this Update** NPS authentication may break, and wireless clients may fail to connect.

Bingo. Add in the Workaround and printers immediately logged in, terminals restarted their connection and all was at peace with the world again. On the server, set the following DWORD registry key's value to = 0:

    SYSTEM\CurrentControlSet\Services\RasMan\PPP\EAP\13\DisableEndEntityClientCertCheck

  References: [https://support.microsoft.com/en-us/help/4034681/windows-8-1-windows-server-2012-r2-update-kb4034681](https://support.microsoft.com/en-us/help/4034681/windows-8-1-windows-server-2012-r2-update-kb4034681)
