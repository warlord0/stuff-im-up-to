---
pubDatetime: 2021-07-07T21:22:17Z
title: "Kindle PaperWhite 1"
tags:
  - "Privateer"
description: "I've got a few Kindles that the wife an I use. The one I use primarily is a PaperWhite 1 - it's been used almost every day for many years. The one thing I"
---
I've got a few Kindles that the wife an I use. The one I use primarily is a PaperWhite 1 - it's been used almost every day for many years. The one thing I did to it was to jailbreak it so I could use a custom screen saver. I like it to be easily identified as mine.

I got the jailbreak from the forums at [https://www.mobileread.com](https://www.mobileread.com) as I did it so long ago I couldn't remember what I did to make it happen. To redo it on another PaperWhite 1 caused some serious head scratching. Time to document what I did.

Download the 5.4.4.2 version of the Kindle firmware. This is as high as we can go on the PW1 to jailbreak it this way.

[https://s3.amazonaws.com/G7G_FirmwareUpdates_WebDownloads/update_kindle_5.4.4.2.bin](https://s3.amazonaws.com/G7G_FirmwareUpdates_WebDownloads/update_kindle_5.4.4.2.bin)

Copy it to the root of the Kindle's USB shared volume. I prefer to use a command line and plain old `cp` this what it finishes copying before you get the prompt back. You can be sure it all got there.

Eject the Kindle and go to the settings menu, then settings menu again - you should see the option to "Upgrade your Kindle". Choose this and let it upgrade and reboot. Nothing happens quickly with a Kindle.

Next, we want the jailbreak package from:

[https://www.mobileread.com/forums/showthread.php?t=186645](https://www.mobileread.com/forums/showthread.php?t=186645)

[https://storage.gra.cloud.ovh.net/v1/AUTH_2ac4bfee353948ec8ea7fd1710574097/mr-public/Touch/kindle-jailbreak-1.16.N-r18474.tar.xz](https://storage.gra.cloud.ovh.net/v1/AUTH_2ac4bfee353948ec8ea7fd1710574097/mr-public/Touch/kindle-jailbreak-1.16.N-r18474.tar.xz)

Open this up and extract the entire kindle-54-jailbreak.zip package into your Kindles USB volume's root. Repeat the process of eject, visit the settings menu and settings to update your device again.

You should see `#### JAILBREAK ####` appear at the bottom of the page. Job done. Restart the Kindle.

Next we need kual. Download it and extract the KUAL-KDK-2.0.azw2 file to the Kindles document folder:

[https://www.mobileread.com/forums/showthread.php?t=203326](https://www.mobileread.com/forums/showthread.php?t=203326)

[https://storage.gra.cloud.ovh.net/v1/AUTH_2ac4bfee353948ec8ea7fd1710574097/mr-public/KUAL/KUAL-v2.7.24-g9f3694a-20200604.tar.xz](https://storage.gra.cloud.ovh.net/v1/AUTH_2ac4bfee353948ec8ea7fd1710574097/mr-public/KUAL/KUAL-v2.7.24-g9f3694a-20200604.tar.xz)

Download the MRPI package

[https://www.mobileread.com/forums/showthread.php?t=251143](https://www.mobileread.com/forums/showthread.php?t=251143)

[https://storage.gra.cloud.ovh.net/v1/AUTH_2ac4bfee353948ec8ea7fd1710574097/mr-public/KUAL/kual-mrinstaller-1.7.N-r18575.tar.xz](https://storage.gra.cloud.ovh.net/v1/AUTH_2ac4bfee353948ec8ea7fd1710574097/mr-public/KUAL/kual-mrinstaller-1.7.N-r18575.tar.xz)

Extract the contents to the root of the Kindle.

Now we can install the screen saver package.

[https://www.mobileread.com/forums/showthread.php?t=195474](https://www.mobileread.com/forums/showthread.php?t=195474)

[https://storage.gra.cloud.ovh.net/v1/AUTH_2ac4bfee353948ec8ea7fd1710574097/mr-public/Touch/kindle-linkss-0.25.N-r18575.tar.xz](https://storage.gra.cloud.ovh.net/v1/AUTH_2ac4bfee353948ec8ea7fd1710574097/mr-public/Touch/kindle-linkss-0.25.N-r18575.tar.xz)

Extract the Update_linkss_0.25.N_install_touch_pw.bin file to the `mrpackages` folder on the Kindle.

Eject the Kindle and then search for and open the KUAL document. Choose the helper and select to install MR packages. This should find the screensavers and install it ready to use whatever images you want to use.

## Downloads

[https://www.mobileread.com/forums/showthread.php?t=225030](https://www.mobileread.com/forums/showthread.php?t=225030)
