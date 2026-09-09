---
pubDatetime: 2017-02-25T14:08:51Z
title: "Updating ADFS Certificates"
tags:
  - "certificates"
  - "Windows"
description: "This wasn't as easy as I thought it was going to be. I expected just to import the new certificate into the mmc certificate snap in and then set ADFS to use it in the ADFS Management console by choosing \"Set Service Communication Certificate...\". Why would it need to be more difficult than that?"
---
This wasn't as easy as I thought it was going to be. I expected just to import the new certificate into the mmc certificate snap in and then set ADFS to use it in the ADFS Management console by choosing "Set Service Communication Certificate...". Why would it need to be more difficult than that? Turns out it is more difficult than that. I tried a few things to get it going with no success. The service starts up just fine, but the website at https://adfs.domain.tld remains down. I check out event viewer and sure enough we have some pretty useless errors logged when I try to visit it.

> Event ID: 15021, An error occurred while using SSL configuration for endpoint adfs.domain.tld:443.  The error status code is contained within the returned data.

First I made sure the imported certificate had the private key permissions needed. In the MMC snap in make sure the service account used has permission to the key. In our case this is an account `DOMAIN\GmAdfs$`. I also made sure the `NT SERVICE\adfssrv` and `NT SERVICE\drs` accounts had access too. Still no joy. Restarted the ADFS service, rebooted. Still the same. **You have to resort to PowerShell.** List the certificates in your Local Machines store. Copy the thumbprint of the certificate you want to use. In our case it's the external wildcard cert `*.domain.tld`, and then use the commands `set-adfsAdfsCertificate` and `set-adfsSslCertificate`.

    PS C:\> dir cert:\LocalMachine\My

    Directory: Microsoft.PowerShell.Security\Certificate::LocalMachine\My

    Thumbprint Subject
    ---------- -------
    87147691F99BEB15B111111A6160EE3E60078F91 CN=ADFS.domain.local
    2DF8631111111111F369CE8C355C9B543DC81ECD CN=*.domain.tld, O=Company Name, L=Location, S=City...

    PS C:\> Set-AdfsCertificate -CertificateType Service-Communications -Thumbprint 2DF8631111111111F369CE8C355C9B543DC81ECD

    WARNING: PS0038: This action requires a restart of the AD FS Windows Service. If you have deployed a federation server farm, restart the service on every server in the farm.

    PS C:\> set-adfsSslCertificate -Thumbprint 2DF8631111111111F369CE8C355C9B543DC81ECD

Now it's back online after a restart.   References: [https://blogs.msdn.microsoft.com/vilath/2015/09/02/how-to-update-certificates-for-ad-fs-3-0/](https://blogs.msdn.microsoft.com/vilath/2015/09/02/how-to-update-certificates-for-ad-fs-3-0/)
