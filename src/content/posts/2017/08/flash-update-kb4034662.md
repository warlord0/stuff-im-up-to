---
pubDatetime: 2017-08-17T12:01:50Z
title: "Flash Update KB4034662"
tags:
  - "updates"
  - "Windows"
heroImage: "/blog-media/2016/09/windows-server-2012-1024x196.png"
description: "Two of our Windows 2012R2 servers constantly failed to apply Windows Updates. They'd start deploying the updates but every time a reboot was required the u"
---
Two of our Windows 2012R2 servers constantly failed to apply Windows Updates. They'd start deploying the updates but every time a reboot was required the updates would all roll back. After several weeks of various members of the IT team banging their heads on their desks and the walls, I stepped up and took a look at the problem. It was a real doozy. Took me ages trying to figure out what was going on. It all turned out to be down to one update for Flash player! We don't even use flash player on any of the servers. We went through the repairs using DISM and SFC

    C:\> SFC /ScanNow
    C:\> DISM /Online /Cleanup-Image /RestoreHealth

And no fault was found and it made no difference to the update. Looking in the `c:\windows\system32\cbs\cbs.log` provided a few clues to the problem, but it gets filled with so much data, so quickly that ultimately the part of the clue that helped was from here, but like finding a needle in a haystack. But related to the event log entry these two pieces pointed to the problem.

    Fault bucket , type 0
    Event Name: WindowsWcpOtherFailure3
    Response: Not available
    Cab Id: 0

    Problem signature:
    P1: 6.3.9600
    P2: plugins\iefileinstallai\iefileinstallai.cpp
    P3: Windows::WCP::IEFileInstallAI::IEFileInstallAI::UninstallFile
    P4: 661
    P5: 8007010b
    P6: 0xd5729a64
    P7: 
    P8: 
    P9: 
    P10: 

    Attached files:

    These files may be available here:
    C:\ProgramData\Microsoft\Windows\WER\ReportQueue\Critical_6.3.9600_d3eb182be284a678b5bc477652a18c4ac13321d_00000000_0c5086d3

    Analysis symbol: 
    Rechecking for solution: 0
    Report Id: cb26015c-832e-11e7-8214-0050568e5384
    Report Status: 4100
    Hashed bucket:

In the event log the Event ID 1001 gave the clue in the 8007010b error code. This is a directory/path not found message. So revisiting the `cbs.log` I saw the entries:

    2017-08-17 11:38:49, Info                  CSI    0000003d Dest Path: [34]"$(runtime.system32)\Macromed\Flash".
    2017-08-17 11:38:49, Info                  CSI    0000003e File Name: [11]"activex.vch".
    2017-08-17 11:38:49, Info                  CSI    0000003f Source File: [l:226{113}]"C:\Windows\WinSxS\amd64_adobe-flash-for-windows_31bf3856ad364e35_7.3.9600.18560_none_0de03542c860d35e\activex.vch"
    2017-08-17 11:38:49, Info                  CSI    00000040 Destination File: [l:92{46}]"C:\Windows\System32\Macromed\Flash\activex.vch"
    2017-08-17 11:38:49, Info                  CSI    00000041 Windows::WCP::IEFileInstallAI::IEFileInstallAI::InstallFile([ml:228{114},l:226{113}]"C:\Windows\WinSxS\amd64_adobe-flash-for-windows_31bf3856ad364e35_7.3.9600.18560_none_0de03542c860d35e\activex.vch", [ml:94{47},l:92{46}]"C:\Windows\System32\Macromed\Flash\activex.vch", TRUE).
    2017-08-17 11:38:49, Error                 CSI    00000056@2017/8/17:10:38:49.206 (F) base\wcp\plugins\iefileinstallai\iefileinstallai.cpp(453): Error HRESULT_FROM_WIN32(ERROR_PATH_NOT_FOUND) originated in function Windows::WCP::IEFileInstallAI::IEFileInstallAI::InstallFile expression: fSuccess

I looked under the path `c:\windows\system32` and there was no `Macromed` folder! I just created this and the subfolder `Flash` and ran the update. It worked! So now all the other updates are flowing on as they should.

## Install Updates One by One!

One thing that helped me identify that the problem was this specific update was using the Windows command line `shutdown` command. By default when an update requires a reboot and you reboot the server the update process delivers all other waiting updates - as in "Install Updates and Shut Down". This meant that even if you chose only to install one or two updates selectively they would seem to fail. When in reality it was because every reboot made the update process deliver this failing update. So to prevent this behaviour I selected one update and instead of clicking the "Reboot" button when it was completed I went to the command line and used shutdown.

    C:\> shutdown /s /t 0

Which is a shut down NOW. The selected update then installed successfully with no rollback and eventually I was left with this one remaining update.
