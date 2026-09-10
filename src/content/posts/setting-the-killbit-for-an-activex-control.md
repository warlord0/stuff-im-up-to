---
pubDatetime: 2017-03-07T14:08:41Z
modDatetime: 2017-03-07T14:10:36Z
title: "Setting the Killbit for an ActiveX Control"
tags:
  - "Security"
  - "Windows"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "Adding a killbit for a control that Nessus says requires one. https://support.microsoft.com/en-gb/help/240797/how-to-stop-an-activex-control-from-running-i"
---
Adding a killbit for a control that Nessus says requires one. [https://support.microsoft.com/en-gb/help/240797/how-to-stop-an-activex-control-from-running-in-internet-explorer](https://support.microsoft.com/en-gb/help/240797/how-to-stop-an-activex-control-from-running-in-internet-explorer) In brief you need to find or create the classid in:

    HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Internet Explorer\ActiveX Compatibility

However, on one I found I first had to hunt the name in `HKEY_CLASSES_ROOT\CLSID` eg. Nessus reported

```
  Class Identifier  : {D63891F1-E026-11D3-A6C3-005004055C6C}
  Filename          : C:\Program Files (x86)\xxxx\Runtime\NCSECW.DLL
  Installed version : 1.6.6.32
```

But when I search for `NCSECW.DLL` I got a different Class ID and that was what I needed to use to add a killbit for.
