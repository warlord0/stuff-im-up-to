---
pubDatetime: 2017-02-10T08:37:17Z
modDatetime: 2017-03-03T10:50:01Z
title: "OpenVPN & DNS Lookup Failures"
tags:
  - "Networking"
  - "openvpn"
  - "Windows"
heroImage: "/blog-media/2016/09/openvpntech_logo1.png"
description: "I've noticed that occasionally my OpenVPN connection fails to resolve host names for systems at the other end of the tunnel. If I check the DHCP settings I can see I am being pushed the DNS servers for the remote end, but nslookup fails to use them."
---
I've noticed that occasionally my OpenVPN connection fails to resolve host names for systems at the other end of the tunnel. If I check the DHCP settings I can see I am being pushed the DNS servers for the remote end, but nslookup fails to use them. This is to do with the binding order. In previous version of Windows you could adjust the binding order, but on Windows 10 this option has been removed. To ensure your OpenVPN Interface appears before your other adapters you need to use some PowerShell to change the InterfaceMetric. The lower the number the higher the priority. View the current interface metrics:

    PS C:> Get-NetIPInterface

    ifIndex InterfaceAlias                  AddressFamily NlMtu(Bytes) InterfaceMetric Dhcp     ConnectionState PolicyStore
    ------- --------------                  ------------- ------------ --------------- ----     --------------- -----------
    10      isatap.{38D4AE9A-7FAC-4EA3-9... IPv6                  1280              75 Disabled Disconnected    ActiveStore
    17      isatap.domain.local             IPv6                  1280              75 Enabled  Disconnected    ActiveStore
    7       Teredo Tunneling Pseudo-Inte... IPv6                  1280              75 Enabled  Disconnected    ActiveStore
    6       VirtualBox Host-Only Network    IPv6                  1500              25 Enabled  Connected       ActiveStore
    21      isatap.whalesanctuary.co.uk     IPv6                  1280              75 Disabled Disconnected    ActiveStore
    20      Ethernet 2                      IPv6                  1500              75 Enabled  Connected       ActiveStore
    1       Loopback Pseudo-Interface 1     IPv6            4294967295              75 Disabled Connected       ActiveStore
    14      Local Area Connection* 2        IPv6                  1500              25 Disabled Disconnected    ActiveStore
    5       Ethernet                        IPv6                  1500               5 Disabled Disconnected    ActiveStore
    19      Wi-Fi                           IPv6                  1500              30 Enabled  Connected       ActiveStore
    6       VirtualBox Host-Only Network    IPv4                  1500              25 Disabled Connected       ActiveStore
    20      Ethernet 2                      IPv4                  1500              75 Enabled  Connected       ActiveStore
    1       Loopback Pseudo-Interface 1     IPv4            4294967295              75 Disabled Connected       ActiveStore
    14      Local Area Connection* 2        IPv4                  1500              25 Enabled  Disconnected    ActiveStore
    5       Ethernet                        IPv4                  1500               5 Enabled  Disconnected    ActiveStore
    19      Wi-Fi                           IPv4                  1500              30 Enabled  Connected       ActiveStore

Use the `ifindex` listed against your OpenVPN adapter. In my case it was 20 for "Ethernet 2" I then just raised this from 75 to 10:

    PS C:\> Set-NetIPInterface -InterfaceIndex 20 -InterfaceMetric 10

References: [https://technet.microsoft.com/en-us/library/hh826125(v=wps.630).aspx](https://technet.microsoft.com/en-us/library/hh826125(v=wps.630).aspx) For Windows 7 You'll need to raise the "\[Remote Access Connections\]" above the "Local Area Connection" using the following reference. References: [https://support.microsoft.com/en-gb/help/2526067](https://support.microsoft.com/en-gb/help/2526067)
