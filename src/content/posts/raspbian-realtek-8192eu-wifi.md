---
pubDatetime: 2017-02-19T13:02:30Z
modDatetime: 2017-02-19T13:12:09Z
title: "Raspbian & Realtek 8192eu WiFi"
tags:
  - "Linux"
  - "Privateer"
  - "raspberry pi"
description: "Probably the best way to get Raspbian up and running over Wifi is to use an out of the box supported Wifi adapter. But as things move on faster Wifi become"
---
Probably the best way to get Raspbian up and running over Wifi is to use an out of the box supported Wifi adapter. But as things move on faster Wifi becomes available and not all of the USB adapters are ready to play. One that I bought recently was one with a **Realtek 8192eu chipset**. This is supposed to deliver 300Mbps Wifi, but comes at the price of not being natively supported by Raspbian. I could go install the build essentials and try to compile the driver myself. But that seems like a lot of work. So a little digging around and I found it's pretty straight forward to get going and it's not a problem unique to me. Someone else has already created the necessary drivers all I need to do is install them. Finding the answers on the Raspberry Pi forums here: [https://www.raspberrypi.org/forums/viewtopic.php?f=45&t=103989](https://www.raspberrypi.org/forums/viewtopic.php?f=45&t=103989) leads to a bit of reading to figure out how to do this. But it really is very straight forward thanks to MrEngMan. Heres the details of the USB adapter that Raspbian reports:

    $ lsusb
    ...
    Bus 001 Device 022: ID 0bda:818b Realtek Semiconductor Corp.
    ...

Find out what version of Raspbian you are runing.

    $ uname -a
    Linux raspberrypi 4.4.34+ #930 Wed Nov 23 15:12:30 GMT 2016 armv6l GNU/Linux

Take the version and the build number to download the file from MrEngMan's dropbox. The filename is in the format `8192eu-[VERSION]-[BUILD].tar.gz` So for my version 4.4.34 build 930 I needed to download `8192eu-`**`4.4.34`**`-`**`930`**`.tar.gz` using the link: [https://dl.dropboxusercontent.com/u/80256631/8192eu-4.4.34-930.tar.gz](https://dl.dropboxusercontent.com/u/80256631/8192eu-4.4.34-930.tar.gz) You can do this using `wget` on the Raspberry if you have it connected to the Wired LAN, or download it onto a USB stick and put it into the Raspberry. Extract the tar file on the Raspberry:

    $ tar xvzf 8192eu-4.4.34-930.tar.gz

And then run the install script:

    $ sudo sh ./install.sh

When it's complete you can then configure your Wifi from the command line by adding in the network SSID and PSK to the `/etc/wpa_supplicant/wpa_supplicant.conf` file:

    $ sudo vi /etc/wpa_supplicant/wpa_supplicant.conf

Add in:

    network={
      ssid="MYNETWORK"
      psk="mysecretkey"
    }

Then a reboot of the Rasperry should see you connected to the network!
