---
pubDatetime: 2020-02-03T16:20:00Z
modDatetime: 2020-02-02T16:40:30Z
title: "Dual Boot Windows 10 and Ubuntu"
tags:
  - "Linux"
  - "Windows"
description: "EFI, Windows 10 and Ubuntu make for a bumpy road. After installing Ubuntu onto the partition I made available in Windows 10, Ubuntu configured grub and whe"
---
EFI, Windows 10 and Ubuntu make for a bumpy road. After installing Ubuntu onto the partition I made available in Windows 10, Ubuntu configured grub and when I rebooted there was a nice menu to let me select which OS I wanted to boot. "Ubuntu" or "Windows 10 Boot Manager".

It worked great ... until I booted into Windows 10 and then at the next boot there was no more menu. Just boot straight back into Windows 10 again.

It appears Windows likes to overwrite your boot manager with it's own after every startup.

After some Googling it's a common problem, and many look towards [EasyUEFI](https://www.easyuefi.com/index-us.html) to help. In my case it was useful as it showed me what boot manager Ubuntu was was using, which meant I could use that to replace the Windows 10 boot manager - I didn't use EasyUEFI for this.

Windows 10 has a command line utility `bcdedit` that allows you to change boot settings. Now that EasyUEFI let me find that the Ubuntu boot manager used `\EFI\ubuntu\shimx64.efi` I was able to change the Windows path for the Ubuntu path using:

```
c:\> bcdedit /set {bootmgr} "\EFI\ubuntu\shimx64.efi"
```

Of course I made a copy of the settings before changing it from `\EFI\Microsoft\Boot\bootmgfw.efi` to `\EFI\ubuntu\shimx64.efi`.

It looks like the basic principle would be applied to other EFI boots of other Linux distributions too. Find the distributions boot efi file and then change Windows 10 to point at that.
