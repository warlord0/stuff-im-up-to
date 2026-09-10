---
pubDatetime: 2017-03-10T08:37:59Z
modDatetime: 2017-03-10T08:44:54Z
title: "Dell iDRAC and Certificates"
tags:
  - "certificates"
  - "Networking"
  - "ssl"
heroImage: "/blog-media/2017/03/dell_logo.png"
description: "A wider vulnerability scan picked up that we had self signed certificates on our Dell iDRAC's (Dell Remote Access Controller). But also highlighted that th"
---
A wider vulnerability scan picked up that we had self signed certificates on our Dell iDRAC's (Dell Remote Access Controller). But also highlighted that the certificates keys were too small. So that meant in order to resolved the issue we must issue our own certificates and ensure they are the right key size. This would normally be fairly straight forward. Use the Web UI to generate a CSR and then submit that to the CA. Then just upload the issued certificate to the Web UI and all is done. However, when we submitted the CSR the CA responded with an "Denied by Policy Module" error. In the CA servers `Application` event log we see Event ID: 53

    Active Directory Certificate Services denied request 78050 because The public key does not meet the minimum size required by the specified certificate template. 0x80094811 (-2146875375 CERTSRV_E_KEY_LENGTH).  The request was for E=root@localhost, CN=DRAC.domain.local, OU=My OU, O=My Organisation, L=Any Town, S=Some County, C=UK.  Additional information: Denied by Policy Module

The iDRAC's we have are in servers that are quite old now. We have a few versions from  iDRAC 5, 7 and 8. After a Google we found this is a known problem as the iDRAC's request is for a key size of 1024 bit, but our CA template/Policy requires key sizes to be 2048 bit or above. The Web UI isn't the only way to manage the DRAC. You can use your own machine and manage them remotely using the DRAC Tool `racadm`. This gives us the ability to set an important option that isn't available on the Web UI. The option we're looking for is `cfgRacSecCsrKeySize` which by default is set to 1024. Download the DRAC tools (32 or 64bit) from your servers support downloads page under "Systems Management". It extracts a zip file into `c:\OpenManage`. Install the `RACTools_XXX.msi` file and it will install the necessary tools into `c:\Program Files\Dell\SysMgt`. Start a command line (cmd) and goto the location with the `racadm.exe`. In our case it is `c:\Program Files\Dell\SysMgt\rac5`. You can get the current setting using:

    c:\> cd c:\Program Files\Dell\SysMgt\rac5

    c:\> racadm -r [DRAC.domain.local] -u [USER] -p [PASSWORD] getconfig -g cfgRacSecurity -o cfgRacSecCsrKeySize

The default user name and password are `root/calvin`, but you've obviously changed this to something more appropriate. You may see some warnings in what you get back (obviously the certificate warning is to be expected), but somewhere in there you'll see it returns `1024`.

    Security Alert: Certificate is invalid - Certificate is not signed by Trusted Third Party
    Continuing execution. Use -S option for racadm to stop execution on certificate-related errors.
    1024

    RAC1168: The RACADM "getconfig" command will be deprecated in a future version of iDRAC firmware. Run the RACADM
    "racadm get" command to retrieve the iDRAC configuration parameters.
    For more information on the get command, run the RACADM command "racadm help get".

We need to change this to 2048 uisng:

    c:\> racadm -r [DRAC.domain.local] -u [USER] -p [PASSWORD] config -g cfgRacSecurity -o cfgRacSecCsrKeySize 2048

Now we can use racadm to generate the CSR for us and put it into a file.

    c:\> racadm -r [DRAC.domain.local] -u [USER] -p [PASSWORD] sslcsrgen -g -f [DRAC].csr

Then we can take that csr file and use the content with our CA to get a certificate we can upload to the Web UI References: [http://en.community.dell.com/techcenter/systems-management/f/4469/t/19453058](http://en.community.dell.com/techcenter/systems-management/f/4469/t/19453058)
