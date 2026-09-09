---
pubDatetime: 2017-02-09T13:27:12Z
modDatetime: 2017-02-18T18:35:00Z
title: "TLS and NPS"
tags:
  - "Security"
  - "ssl"
  - "Windows"
description: "Looks like NPS only supports TLS1.0 by default. So if you go restricting your ciphers too much you'll find none of your NPS clients able to connect using E"
---
Looks like NPS only supports TLS1.0 by default. So if you go restricting your ciphers too much you'll find none of your NPS clients able to connect using EAP. That's a bit of a problem when you have an 802.1x secure network and every client is expected to authenticate. If a cipher is not available on both client and server then you'll get a client unable to connect or reconnect when their sessions require. So in order to expand the ciphers supported by newer systems you should ensure you can deliver them over a wider number of protocols , including TLS1.1 and 1.2.

### Ensure you have the required update patch for your system

To add these registry values, follow these steps:

1.  Click **Start**, click **Run**, type regedit in the **Open** box, and then click **OK**.
2.  Locate and then click the following subkey in the registry:
    **HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\services\RasMan\PPP\EAP\13**
3.  On the **Edit** menu, point to **New**, and then click **DWORD Value**.
4.  Type TlsVersion for the name of the DWORD, and then press Enter.
5.  Right-click **TlsVersion**, and then click **Modify**.
6.  In the **Value data** box, use the following values for the various versions of TLS, and then click **OK**.
    |             |             |
    |-------------|-------------|
    | TLS version | DWORD value |
    | TLS 1.0     | 0xC0        |
    | TLS 1.1     | 0x300       |
    | TLS 1.2     | 0xC00       |

    Any OR'ed combination of these values will enable the corresponding protocols. By default, TLS 1.0 is enabled. If any invalid value is configured, TLS 1.0 will be used.
7.  Exit Registry Editor, and then either restart the computer or restart the EapHost service.

 

> Support for TLS1.0, 1.1 and 1.2 = 0xFC0. TLS1.1 and 1.2 only = 0xF00.

References: [https://support.microsoft.com/en-us/help/2977292/microsoft-security-advisory-update-for-microsoft-eap-implementation-that-enables-the-use-of-tls-october-14,-2014](https://support.microsoft.com/en-us/help/2977292/microsoft-security-advisory-update-for-microsoft-eap-implementation-that-enables-the-use-of-tls-october-14,-2014)
