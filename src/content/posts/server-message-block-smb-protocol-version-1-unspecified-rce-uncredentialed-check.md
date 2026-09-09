---
pubDatetime: 2017-02-09T08:31:55Z
modDatetime: 2017-02-11T15:26:35Z
title: "Server Message Block (SMB) Protocol Version 1 Unspecified RCE (uncredentialed check)"
tags:
  - "Security"
  - "Windows"
description: "Start Powershell as an administrator and run the following to disable SMB Version 1. PS C:\\> Get-SmbServerConfiguration | select enablesmb1protocol enables"
---
Start Powershell as an administrator and run the following to disable SMB Version 1.

    PS C:\> Get-SmbServerConfiguration | select enablesmb1protocol

    enablesmb1protocol
     ------------------
     True


    PS C:\> Set-SmbServerConfiguration -EnableSMB1Protocol $false

    Confirm
    Are you sure you want to perform this action?
    Performing operation 'Modify' on Target 'SMB Server Configuration'.
    [Y] Yes [A] Yes to All [N] No [L] No to All [S] Suspend [?] Help (default is "Y"):

    PS C:\> Get-SmbServerConfiguration | select enablesmb1protocol

    enablesmb1protocol
     ------------------
     False

On Windows 2008 you need to do this by using the registry. Add/edit the following Key and set it to 0 (Zero). To enable or disable SMBv1 on the SMB server, configure the following registry key:

    Registry subkey: HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\LanmanServer\Parameters

    Registry entry: SMB1
    REG_DWORD: 0 = Disabled
    REG_DWORD: 1 = Enabled
    Default: 1 = Enabled

Then you need to run some command line (as administrator) programs:

    c:\> sc.exe config lanmanworkstation depend= bowser/mrxsmb20/nsi
    c:\> sc.exe config mrxsmb10 start= disabled

If you only add the registry change Nessus will then complain that the client is still vulnerable. References: [https://support.microsoft.com/en-us/help/2696547/how-to-enable-and-disable-smbv1,-smbv2,-and-smbv3-in-windows-vista,-windows-server-2008,-windows-7,-windows-server-2008-r2,-windows-8,-and-windows-server-2012](https://support.microsoft.com/en-us/help/2696547/how-to-enable-and-disable-smbv1,-smbv2,-and-smbv3-in-windows-vista,-windows-server-2008,-windows-7,-windows-server-2008-r2,-windows-8,-and-windows-server-2012)
