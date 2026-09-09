---
pubDatetime: 2017-04-26T10:22:03Z
modDatetime: 2017-04-28T07:22:42Z
title: "Sophos UTM HA"
tags:
  - "Networking"
  - "Security"
description: "We encountered a few problems with licensing when we looked at moving from the UTM525's to UTM430's so we had to delay the project until yesterday. On the"
---
We encountered a few problems with licensing when we looked at moving from the UTM525's to UTM430's so we had to delay the project until yesterday. On the one hand it gave us plenty of time to plan for the eventualities like Martians and be confident that the configuration restore testing worked whilst testing. The one thing we didn't expect was problem getting the two UTM430's to configure themselves using High Availability (HA). We had one box up and running very quickly, but getting HA activated seemed not to connect as expected. We'd see the "master" that we were configuring dropping log entries that it was waiting for the interface to come up. So the slave wasn't connecting at all. After a long, frustrating and totally fruitless call to Sophos support - never have I felt so let down by Sophos, we discovered the problem. Sophos/Astaro no longer seem to configure the base images to automatically enable HA. Previously the installation process was power on the "master" enable HA in the web GUI and set it to automatic on eth3. Then power on the factory default "slave" and presto HA deals with sync'ing the configs. I tried asking the Sophos engineer how to configure HA by CLI and the response was to setup the "slave" following the basic setup, giving it an IP address and then going to the "slave" Web GUI to turn on HA - what a waste of breath. It was a far simpler solution to just go to the "slave" console CLI and enable HA with no other messing about halfway setting up the UTM. Here's how we did it:

- Take the backup file from the old UTM525's and place in the root folder of a Fat32 USB stick.
- Plug the USB stick into the "master" and power it on. This will restore the .abf config file it finds on the stick.
- Go to the "master" Web GUI.
- Upload your working license file - this is probably the first thing you'll see when you get to the Web GUI.
- Go to "Management", "High Availability" and set the Operation mode to "Hot Standby (active-passive)"
- We then set the Configuration method to Manual and set the NIC to eth3 (which is supposed to be the default HA NIC), set the Device Name, Set as Node ID 1 and put in an encryption key.

&nbsp;

    Sync NIC: eth3
    Device Name: TOP
    Device Node ID: 1
    Encryption Key: MySecretKey

- And apply the changes. If you view the log eventually you'll see entries appear about waiting for the interface to come up.

*Now for the bit Sophos struggled to tell us.*

- Power up the "slave" whilst it's completely factory fresh. Do not put the USB stick into it, we don't want any config at all. Just fresh out of the box. If you haven't got a fresh box then use the LCD panel to reset it to Factory Defaults.
- At the login prompt use `root`.
- You'll be asked to change the password. For the current password you can put anything, we left it blank. Then just enter the New password you'd like to use.
- You should then end up logged in at the `#` prompt.
- The key command here to setup HA is `sethacfg`. It even provides help!

&nbsp;

    # sethacfg -help
    To disable Zeroconf/HA/Cluster mode, please use:
     sethacfg -m off

    To enable Zeroconf mode, please specify these parameters:
     -m zeroconf
     -i 

    To enable HA mode, please specify these parameters:
     -m hot_standby
     -i 
     -p 
     -n 
     -id <1|2>

    To enable Cluster mode, please specify these parameters:
     -m cluster
     -i 
     -p 
     -n 
     -id <1|2|3|4|5|6|7|8|9|10>

    Optional parameters for HA/Cluster mode:
     -j <yes|no>: autojoin, default is yes

- So to join our HA master on eth3 all we needed to do was:

&nbsp;

    # sethacfg -m hot_standby -i [eth3] -p [MySecretKey] -n [BOTTOM] -id [2]

- We called our devices TOP and BOTTOM and gave them ID's of 1 and 2.
- And if you're still watching the log file on the "master" you see the magic start to happen.

In brief:

1.  Configure "master"
2.  Enable HA on "master"
3.  Power On "slave"
4.  Log in to "slave" as `root`
5.  Run `sethacfg` on "slave" with the matching credentials you gave the "master"
