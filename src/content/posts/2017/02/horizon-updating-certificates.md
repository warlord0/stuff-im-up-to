---
pubDatetime: 2017-02-24T09:21:15Z
modDatetime: 2017-02-24T09:27:09Z
title: "Horizon Updating Certificates"
tags:
  - "certificates"
  - "horizon"
  - "vmware"
  - "Windows"
heroImage: "/blog-media/2016/10/vmware-logo-eps-vector-image-800x533-e1476948729563.png"
description: "Updating certificates on the Windows hosts for Connection and Security Servers. Import the signed SSL server certificate into the Windows local computer ce"
---
## Updating certificates on the Windows hosts for Connection and Security Servers.

Import the signed SSL server certificate into the Windows local computer certificate store on the Windows Server host.

In the Certificate snap-in, import the server certificate into the Certificates (Local Computer) \> Personal \> Certificates folder.

Select **Mark this key as exportable**.

Click Next and click Finish.

For **View Connection Server or Security server**, add the certificate Friendly name, '**vdm'**, to the new certificate that is replacing the previous certificate. You should only have one certificate with the friendly name vdm, so make sure it's only the most current certificate.

Right-click the new certificate and click Properties

On the General tab, in the Friendly name field, type **vdm**.

Click Apply and click OK.

## Updating certificates on the Windows hosts for Composer Servers.

For a **View Composer** server, run the SviConfig ReplaceCertificate utility to bind the new certificate to the port used by View Composer.

This utility replaces the old certificate binding with the new certificate binding.

Stop the View Composer service.

In a Windows command prompt, type the SviConfig ReplaceCertificate command. For example:

```
c:\> sviconfig -operation=ReplaceCertificate -delete=false
```

The utility displays a numbered list of SSL certificates that are available in the Windows local computer certificate store.

To select a certificate, type the number of the certificate and press Enter.

  If intermediate certificates are issued to a View Connection Server, security server, or View Composer host, import the most recent update to the intermediate certificates into the Certificates (Local Computer) \> Intermediate Certification Authorities \> Certificates folder in the Windows certificate store.

> **Restart the View Connection Server service, Security Server service, or View Composer service to make your changes take effect.**

References: [https://pubs.vmware.com/view-52/index.jsp?topic=%2Fcom.vmware.view.administration.doc%2FGUID-5717A5F9-D2E3-4CB7-A0B8-5BBF8F3CBA92.html](https://pubs.vmware.com/view-52/index.jsp?topic=%2Fcom.vmware.view.administration.doc%2FGUID-5717A5F9-D2E3-4CB7-A0B8-5BBF8F3CBA92.html)
