---
pubDatetime: 2019-03-08T08:27:48Z
title: "Spectre and VMWare"
tags:
  - "horizon"
  - "vmware"
  - "Windows"
heroImage: "/blog-media/2019/03/spectre_logo.png"
description: "For some time we've suffered a problem with our Windows 7 VDI systems that has prevented us from applying Windows Updates. If we applied any of the rollups"
---
For some time we've suffered a problem with our Windows 7 VDI systems that has prevented us from applying Windows Updates.

If we applied any of the rollups from March 2018 onward the VDI session would reboot itself under one special condition. If a user/client used the Cisco AnyConnect VPN software within the VDI Guest then almost exactly 2 minutes and 10 seconds after connecting, the VDI machine would throw a fatal error and reboot. Instantly terminating the users session.

As we're about to carry out some auditing the pressure was on to find the solution so we could patch our client estate properly.

Breaking down what the rollups included involved using Nessus to let us see what specific patches had not been applied and then to go through installing each one of them in turn to see which one was killing our sessions.

What we found was that [CVE-2017-5175](https://cve.mitre.org/cgi-bin/cvename.cgi?name=CVE-2017-5715) and related patches was where things failed and we were able to recreate the problem.

> KB4088878: Windows 7 and Windows Server 2008 R2 March 2018 Security Update

A bit of Google-Fu and I found this: [https://support.microsoft.com/en-us/help/4072698/windows-server-speculative-execution-side-channel-vulnerabilities-prot](https://support.microsoft.com/en-us/help/4072698/windows-server-speculative-execution-side-channel-vulnerabilities-prot)

The Windows patches have to be applied, but we then disabled the mitigation using the registry keys below:

#### To disable mitigations for CVE-2017-5715 (Spectre Variant 2) and CVE-2017-5754 (Meltdown)

```
reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v FeatureSettingsOverride /t REG_DWORD /d 3 /f

reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v FeatureSettingsOverrideMask /t REG_DWORD /d 3 /f

reg add "HKEY_LOCAL_MACHINE\SYSTEM\CurrentControlSet\Control\Session Manager\Memory Management" /v FeatureSettingsOverrideMask /t REG_DWORD /d 3 /f
```

Restart the computer for the changes to take effect.
