---
pubDatetime: 2016-10-25T09:03:30Z
modDatetime: 2016-10-25T09:10:28Z
title: "VMWare View 5.3 & vSphere 5.5"
tags:
  - "horizon"
  - "Linux"
  - "vmware"
heroImage: "/blog-media/2016/10/vmware-logo-eps-vector-image-800x533-e1476948729563.png"
description: "As part of our patching process we applied security patches to one of the vSphere ESXi servers. All seemed to go well until we tried to compose systems ont"
---
As part of our patching process we applied security patches to one of the vSphere ESXi servers. All seemed to go well until we tried to compose systems onto it. We ended up with VDI clients being added to the server, but they'd never start up. Clearly this was something to do with the patches that were applied. Checking the log bundle we produced it was certainly an SSL related issue. Those damned certificates again! Well not quite. Reading through the vmware-vdicomposer.log I picked up on a few of these messages:

    Machine Name: VDICOMPOSER, Timestamp: 24/10/2016 15:01:52, App Domain Name: SviWebService.exe, Thread Identity: , Windows Identity: NT AUTHORITY\SYSTEM, OS Version: Microsoft Windows NT 6.1.7601 Service Pack 1, reason: ServiceUnreachable access host: vdiesx01.domain.local access port: 902 disk datastore path: [vdiesx01_fio] VDITestNew_1/VDITestNew_11-internal.vmdk expected certificate thumbprint:

Very strange, a blank thumbprint. Checking the VDI database table dbo.VPX_HOSTS we compared the expected thumbprint to the actual thumbprint on the vSphere server and all looked good. But something couldn't be right. A look at the patches that were installed revealed that the new defaults for enabled protocols would disable SSLv3 - bingo. That'll be the cause then. The only way to have SSLv3 disabled in Horizon/View is to move to Horizon v6.2 (which we should do really). But as we're not quite ready to do that we can turn on SSLv3 again to get the system working. Simply view the list of disabled protocols:

    ~ # esxcli system settings advanced list -o /UserVars/VMAuthdDisabledProtocols

Notice that it shows the "String Value: sslv3" so it's clearly disabled. So we just need to turn it back on and then restart the rhttpproxy service:

    ~ # esxcli system settings advanced set -o /UserVars/VMAuthdDisabledProtocols -s ""
    ~ # /etc/init.d/rhttpproxy restart

This shouldn't be a permanent fix on a production system. SSLv3 is going to flag up in our vulnerability scanning, so we will have to upgrade to Horizon v6.2. But this will at least buy us some time to do that.

    ~ # esxcli system settings advanced list -o /UserVars/VMAuthdDisabledProtocols
       Path: /UserVars/VMAuthdDisabledProtocols
       Type: string
       Int Value: 0
       Default Int Value: 0
       Min Value: 0
       Max Value: 0
       String Value: sslv3
       Default String Value: sslv3
       Valid Characters: *
       Description: VMAuthd disabled protocols. Choices are sslv3, tlsv1, tlsv1.1, tlsv1.2. By default sslv3 is disabled. If no protocol is specified, all protocols are enabled.
    ~ # esxcli system settings advanced set -o /UserVars/VMAuthdDisabledProtocols -s ""
    ~ # esxcli system settings advanced list -o /UserVars/VMAuthdDisabledProtocols
       Path: /UserVars/VMAuthdDisabledProtocols
       Type: string
       Int Value: 0
       Default Int Value: 0
       Min Value: 0
       Max Value: 0
       String Value: 
       Default String Value: sslv3
       Valid Characters: *
       Description: VMAuthd disabled protocols. Choices are sslv3, tlsv1, tlsv1.1, tlsv1.2. By default sslv3 is disabled. If no protocol is specified, all protocols are enabled.
    ~ # /etc/init.d/rhttpproxy restart

  Further reading: [https://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=2139396](https://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=2139396)
