---
pubDatetime: 2017-03-17T08:23:05Z
modDatetime: 2017-03-17T08:36:48Z
title: "Oracle Database Patches"
tags:
  - "Security"
  - "Windows"
description: "Having had to get an Oracle DB expert in to update our Oracle database server a rescan with Nessus still shows some vulnerabilities. c:\\> cd \\Oracle\\produc"
---
Having had to get an Oracle DB expert in to update our Oracle database server a rescan with Nessus still shows some vulnerabilities.

    c:\> cd \Oracle\product\12.1.0.2\dbhome_1\OPatch
    c:\> opatch lsinventory
    Oracle Interim Patch Installer version 12.2.0.1.8
    Copyright (c) 2017, Oracle Corporation. All rights reserved.


    Oracle Home : C:\Oracle\product\1210~1.2\dbhome_1
    Central Inventory : C:\Program Files\Oracle\Inventory
     from :
    OPatch version : 12.2.0.1.8
    OUI version : 12.1.0.2.0
    Log file location : C:\Oracle\product\1210~1.2\dbhome_1\cfgtoollogs\opatch\opatc
    h2017-03-17_07-42-13AM_1.log

    Lsinventory Output file location : C:\Oracle\product\1210~1.2\dbhome_1\cfgtoollo
    gs\opatch\lsinv\lsinventory2017-03-17_07-42-13AM.txt

    ----------------------------------------------------------------------

    Local Machine Information::
    Hostname: ORACLE.domain.local
    ARU platform id: 233
    ARU platform description:: Microsoft Windows (64-bit AMD)

    Installed Top-level Products (1):

    Oracle Database 12c 12.1.0.2.0
    There are 1 products installed in this Oracle Home.
    Interim patches (1) :

    Patch 25433286 : applied on Thu Mar 16 09:17:26 GMT 2017
    Unique Patch ID: 21049556
    Patch description: "WINDOWS DB BUNDLE PATCH 12.1.0.2.170228(64bit):25433286"
     Created on 25 Feb 2017, 01:01:38 hrs PST8PDT
     Bugs fixed:
     20669434, 20361140, 21972664, 18934948, 24437510, 19414168, 23260854
    ...
     24609301, 20995667, 12963364, 20832516, 21899588, 19025195, 19538241
     19162308

    ----------------------------------------------------------------------


    OPatch succeeded.

It has the February patches applied, but Nessus still reports that the server is missing the January patches. Oracle patches are meant to be cumulative, so the February patch should include all of January's too.

> Windows Bundle Patch (BP) patches are cumulative. That is, the content of all previous BPs is included in the latest BP patch.

Looks like we need to wait on Nessus to advise what's going on here as Oracle seem to have changed their patching mechanism and this could be a false positive. But not being an Oracle expert by any stretch of the imagination I'm stuck until someone can advise me better.

|  |  |  |
|----|----|----|
| **Severity** | **Plugin Id** | **Name** |
| Critical (10.0) | [86576](http://www.nessus.org/plugins/index.php?view=single&id=86576) | Oracle Database Multiple Vulnerabilities (October 2015 CPU) |
| High (9.0) | [80906](http://www.nessus.org/plugins/index.php?view=single&id=80906) | Oracle Database Multiple Vulnerabilities (January 2015 CPU) |
| High (9.0) | [82903](http://www.nessus.org/plugins/index.php?view=single&id=82903) | Oracle Database Multiple Vulnerabilities (April 2015 CPU) |
| High (9.0) | [84822](http://www.nessus.org/plugins/index.php?view=single&id=84822) | Oracle Database Multiple Vulnerabilities (July 2015 CPU) |
| High (9.0) | [88146](http://www.nessus.org/plugins/index.php?view=single&id=88146) | Oracle Database Multiple Vulnerabilities (January 2016 CPU) |
| High (9.0) | [94201](http://www.nessus.org/plugins/index.php?view=single&id=94201) | Oracle Database Multiple Vulnerabilities (October 2016 CPU) |
| High (8.5) | [92522](http://www.nessus.org/plugins/index.php?view=single&id=92522) | Oracle Database Multiple Vulnerabilities (July 2016 CPU) (FREAK) |
| High (8.5) | [96611](http://www.nessus.org/plugins/index.php?view=single&id=96611) | Oracle Database Multiple Vulnerabilities (January 2017 CPU) |
| High (7.6) | [90762](http://www.nessus.org/plugins/index.php?view=single&id=90762) | Oracle Database Multiple Vulnerabilities (April 2016 CPU) |

    c:\> opatch lspatches
    25433286;WINDOWS DB BUNDLE PATCH 12.1.0.2.170228(64bit):25433286

The patches are located in the home directory under `.patch_storage` eg. `C:\Oracle\product\12.1.0.2\dbhome_1\.patch_storage` For more details about what's been fixed:

    c:\> opatch lsinventory -bugs_fixed

### **References**

[https://www.pythian.com/blog/oracle-database-12c-psus-vs-database-proactive-bundle-patches/](https://www.pythian.com/blog/oracle-database-12c-psus-vs-database-proactive-bundle-patches/) [https://blogs.oracle.com/UPGRADE/entry/can_i_apply_a_bp](https://blogs.oracle.com/UPGRADE/entry/can_i_apply_a_bp)
