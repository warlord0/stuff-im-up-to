---
pubDatetime: 2017-06-05T13:18:30Z
modDatetime: 2017-06-05T14:54:30Z
title: "Unable to Logon as admin"
tags:
  - "Networking"
  - "radius"
heroImage: "/blog-media/2017/03/extreme.jpg"
description: "I managed to bork one of our test switches today. I was in the process of enabling \"netlogin\" using RADIUS as the authentication method, when I must have i"
---
I managed to bork one of our test switches today. I was in the process of enabling "netlogin" using RADIUS as the authentication method, when I must have inadvertently enabled RADIUS authentication for the management interface instead of just for "netlogin". Using the Extreme documentation as a clue to resolve this kind of issue, but for a forgotten admin password, I was able to modify the instructions slightly to achieve a logon without resorting to a factory reset. [https://gtacknowledge.extremenetworks.com/articles/How_To/How-to-Recover-A-Switch-And-Its-Configuration-Without-The-Password](https://gtacknowledge.extremenetworks.com/articles/How_To/How-to-Recover-A-Switch-And-Its-Configuration-Without-The-Password) Follow the initial steps of rebooting the switch with a default configuration. But modify the line you enter into the `autoexec.xsf` to suit your config requirements. In my case I needed to `disable radius`.

## Initial Steps: Reboot the switch with a default configuration

1\) Connect to the switch via console connection. 2) Power cycle the switch. 3) During the boot process “hold the spacebar” to enter bootrom.

    Extreme Networks
    Alternate BootStrap Image
    Starting CRC of Default image
    Using Default image ...

    Extreme Networks

    Default BootLoader Image
    DRAM Post

    Press and hold the spacebar to enter the bootrom.

4\) In the bootrom, type the commands below to select a default configuration to be booted:

- ​​If your bootrom version is 2.0.2.1 the option config none is not available, upgrade the bootrom to overcome this.

&nbsp;

    BootRom > config none
    BootRom > boot

The switch should now boot with a factory default configuration. Username:admin, Password:\[none\] At this point, perform the steps below, to create an autoexec script

### Method 1: Creating an autoexec script

1\) Enter the vi editor to create an autoexec.xsf file

    vi autoexec.xsf

2\) Press the i key to enter insert mode. 3) This is where we enter the command that we want to run after the `primary.cfg` config has loaded.

    disable radius

4\) Exit insert mode by pressing ESC, then write the file and quit vi by typing `:wq` 5) Reboot the switch by typing `reboot`, but do **NOT** save the config. Saving the config at this point will overwrite the existing configuration with a blank one. 6) When the switch reboots, the `autoexec.xsf` script will be executed, creating the new account. 7) Log in using the admin account should now be possible. 8) Tidy up by deleting the `autoexec.xsf` script

    rm autoexec.xsf

9\) At this point, the switch should be back to its previous configuration. So now make sure you can logon, save the config and you can continue like this never happened.
