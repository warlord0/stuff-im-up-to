---
pubDatetime: 2017-02-12T17:43:07Z
modDatetime: 2017-03-02T12:51:17Z
title: "Hardening Windows"
tags:
  - "Security"
  - "Windows"
description: "When it comes to Microsoft Windows straight out of the box it's full of security weaknesses. These are a number of ways to harden it so that your vulnerabi"
---
When it comes to Microsoft Windows straight out of the box it's full of security weaknesses. These are a number of ways to harden it so that your vulnerability scans pass with nothing more than information messages. The list grows with each discovery of a new vulnerability. This list was last updated **2 March 2017**.

### Disable NTMLv1 - Registry key

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Lsa]
    "lmcompatibilitylevel"=dword:00000003

### Configure an NTP time source - Registry key

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\W32Time\Parameters]
    "NtpServer"="time.domain.local"
    "Type"="NTP"

### Restrict DLL usage - Registry key

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager]
    "CWDIllegalInDllSearch"=dword:00000002

### Disable SSLv3 - Registry key

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\SSL 3.0\Server]
    "Enabled"=dword:00000000
    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\SSL 3.0\Client]
    "Enabled"=dword:00000000
    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Protocols\SSL 2.0\Server]
    "Enabled"=dword:00000000

### Disable Weak Ciphers/Key Exchange - Registry key

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers]

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\DES 56/56]
    "Enabled"=dword:00000000

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\RC2 128/128]
    "Enabled"=dword:00000000

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\RC2 40/128]
    "Enabled"=dword:00000000

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\RC2 56/128]
    "Enabled"=dword:00000000

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\RC4 128/128]
    "Enabled"=dword:00000000

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\RC4 40/128]
    "Enabled"=dword:00000000

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\RC4 56/128]
    "Enabled"=dword:00000000

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\RC4 64/128]
    "Enabled"=dword:00000000

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\Triple DES 168]
    "Enabled"=dword:00000000

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Ciphers\Triple DES 168/168]
    "Enabled"=dword:00000000

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\KeyExchangeAlgorithms]

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\KeyExchangeAlgorithms\Diffie-Hellman]
    "ServerMinKeyBitLength"=dword:00000800

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\SecurityProviders\SCHANNEL\Hashes\MD5]
    "Enabled"=dword:00000000

### Remove MSXML4 - Command line

You may also have to physically delete the `msxml4*.dll` files from the `SysWOW64` directory.

    REM Script to quietly uninstall MSXML 4.0 and updates.
    REM Further information on the support status of MSXML 4.0 can be found at https://altonblom.com/s34e09
    REM Changelog
    REM v0.1 - initial version
    REM v0.2 - updated titles and spacing
    REM Uninstalling MSXML 4.0 SP2 and updates
    REM Uninstalling MSXML 4.0 SP2 Parser and SDK (Base Installer - msxml.msi)
    MsiExec.exe /uninstall {716E0306-8318-4364-8B8F-0CC4E9376BAC} /quiet
    REM Uninstalling KB925672 (MS06-061 - msxml4-KB925672-enu.exe)
    MsiExec.exe /uninstall {A9CF9052-F4A0-475D-A00F-A8388C62DD63} /quiet
    REM Uninstalling KB927978 (MS06-071 - msxml4-KB927978-enu.exe)
    MsiExec.exe /uninstall {37477865-A3F1-4772-AD43-AAFC6BCFF99F} /quiet
    REM Uninstalling KB936181 (MS07-042 - msxml4-KB936181-enu.exe)
    MsiExec.exe /uninstall {C04E32E0-0416-434D-AFB9-6969D703A9EF} /quiet
    REM Uninstalling KB954430 (MS08-069 - msxml4-KB954430-enu.exe)
    MsiExec.exe /uninstall {86493ADD-824D-4B8E-BD72-8C5DCDC52A71} /quiet
    REM Uninstalling KB973688 (Non Security Update - msxml4-KB973688-enu.exe)
    MsiExec.exe /uninstall {F662A8E6-F4DC-41A2-901E-8C11F044BDEC} /quiet
    REM Uninstalling MSXML 4.0 SP3 and updates
    REM Uninstalling MSXML 4.0 SP3 Parser (Base Installer - msxml.msi)
    MsiExec.exe /uninstall {196467F1-C11F-4F76-858B-5812ADC83B94} /quiet
    REM Uninstalling KB973685 (Non Security Update - msxml4-KB973685-enu.exe)
    MsiExec.exe /uninstall {859DFA95-E4A6-48CD-B88E-A3E483E89B44} /quiet
    REM Uninstalling KB2721691 (MS12-043 - msxml4-KB2721691-enu.exe)
    MsiExec.exe /uninstall {355B5AC0-CEEE-42C5-AD4D-7F3CFD806C36} /quiet
    REM Uninstalling KB2758694 (MS13-002 - msxml4-KB2758694-enu.exe)
    MsiExec.exe /uninstall {1D95BA90-F4F8-47EC-A882-441C99D30C1E} /quiet

### Set a GPO to handle hardening UNC paths

#### Registry Key

    [HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\Windows\NetworkProvider\HardenedPaths]
    "\\\\*\\NETLOGON"="RequireMutualAuthentication=1, RequireIntegrity=1"
    "\\\\*\\SYSVOL"="RequireMutualAuthentication=1, RequireIntegrity=1"

**Or by gpedit.msc / GPO** : [https://support.microsoft.com/en-us/kb/3000483](https://support.microsoft.com/en-us/kb/3000483)

#### 

Set the following values in Step 10.

    \\*\NETLOGON RequireMutualAuthentication=1, RequireIntegrity=1

    \\*\SYSVOL RequireMutualAuthentication=1, RequireIntegrity=1

### 

> #### To enable UNC Hardened Access through Group Policy, follow these steps:
>
> 1.  Open Group Policy Management Console.
> 2.  In the console tree, in the forest and domain that contain the Group Policy object (GPO) that you want to create or edit, double-click Group Policy Objects.
>     - Forest name/Domains/\<Domain name\>
> 3.  (Optional) Right-click Group Policy Objects, and then click New.
> 4.  Type the desired name for the new GPO.
> 5.  Right-click the desired GPO, and then click Edit.
> 6.  In the Group Policy Object Editor console, browse to the following policy path:
>     - Computer Configuration/Administrative Templates/Network/Network Provider
> 7.  Right-click the Hardened UNC Paths setting, and then click Edit.
> 8.  Select the Enabled option button.
> 9.  In the Options pane, scroll down, and then click Show.
> 10. Add one or more configuration entries. to do this, follow these steps:
>     1.  In the Value Name column, type the UNC path that you want to configure. The UNC path may be specified in one of the following forms:
>         - \\\<Server\>\\Share\> - The configuration entry applies to the share that has the specified name on the specified server.
>         - \\\*\\Share\> - The configuration entry applies to the share that has the specified name on any server.
>         - \\\<Server\>\\ - The configuration entry applies to any share on the specified server.
>         - \\\<Server\> - The same as \\\<Server\>\\
>         - Note A specific server or share name must be specified. All-wildcard paths such as \\\* and \\\*\\ are not supported.
>     2.  In the Value column, type the name of the security property to configure (for example, type RequireMutualAuthentication, RequireIntegrity, or RequirePrivacy) followed by an equal sign (=) and the number 0 or 1.
>         - Note Multiple properties may be assigned for a single UNC path by separating each "\<Property\> = \<Value\>" pair by using a comma (,).
> 11. Click OK two times, and then close the GPO editor.
> 12. If you created a new GPO earlier, link the GPO to one or more domains. To do this, right-click the desired domain, click Link an Existing GPO, select the newly added GPO, and then click OK.
> 13. To test the new or updated GPO, log on to a computer to which the GPO applies, and then run the following command:
>     - gpupdate /force
>
> Any configuration errors will reported in the following path in Event Viewer: Event Viewer\Applications and Services Ls\Microsoft\Windows\NetworkProvider\Operational

### Make Sure You Use a WSUS Server - Command lime

Fix the identity of your server if you haven't properly `sysprep`'d it.

    net stop wuauserv 
    reg Delete HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate /v PingID /f 
    reg Delete HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate /v AccountDomainSid /f 
    reg Delete HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate /v SusClientId /f 
    reg Delete HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\WindowsUpdate /v SusClientIDValidation /f 
    net start wuauserv 
    wuauclt.exe /resetauthorization /detectnow

### Ensure you Enable the Disallowed Cert Updates - Registry key

    [HKEY_LOCAL_MACHINE\SOFTWARE\Policies\Microsoft\SystemCertificates\AuthRoot]
    "EnableDisallowedCertAutoUpdate"=dword:00000001
    "DisableRootAutoUpdate"=-

### Apply the MS15-124 Hardening - Registry key

    [HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Internet Explorer\MAIN\FeatureControl\FEATURE_ALLOW_USER32_EXCEPTION_HANDLER_HARDENING]
    "iexplore.exe"=dword:00000001

    [HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\Internet Explorer\MAIN\FeatureControl\FEATURE_ALLOW_USER32_EXCEPTION_HANDLER_HARDENING]
    "iexplore.exe"=dword:00000001

### Disable Cached Passwords - Registry key

    [HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon]
    "CachedLogonsCount"="0"

### Apply KB3118753 Kill Bits - Registry key

    [HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Internet Explorer\ActiveX Compatibility\{D4C0DB38-B682-42A8-AF62-DB9247543354}]
    "Compatibility Flags"=dword:00000400

### Set Your Proxy using netsh - Command line

    netsh winhttp set proxy http://192.168.0.117:3128 "<local>"

### Apply KB2960358 Dot Net Crypto Fix - Registry key

    [HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\.NETFramework\v4.0.30319]
    "SchUseStrongCrypto"=dword:00000001

    [HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\.NETFramework\v4.0.30319]
    "SchUseStrongCrypto"=dword:00000001

    [HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\.NETFramework\v2.0.50727]
    "SchUseStrongCrypto"=dword:00000001

    [HKEY_LOCAL_MACHINE\SOFTWARE\Wow6432Node\Microsoft\.NETFramework\v2.0.50727]
    "SchUseStrongCrypto"=dword:00000001

### Disable SMB1

#### Windows 2008 - Command line & Registry key

    sc.exe config lanmanworkstation depend= bowser/mrxsmb20/nsi
    sc.exe config mrxsmb10 start= disabled

    [HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Services\LanmanServer\Parameters]
    "SMB1"=dword:00000000

#### Windows 2012 - PowerShell

    Set-SmbServerConfiguration -enableSMB1Protocol $false

### Apply MS KB2719662: Vulnerabilities in Gadgets - Registry Key

    [HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Windows\CurrentVersion\Policies\Windows\Sidebar]
    "TurnOffSidebar"=dword:00000001
