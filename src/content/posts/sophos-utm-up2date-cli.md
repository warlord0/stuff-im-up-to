---
pubDatetime: 2017-04-04T11:27:35Z
modDatetime: 2017-04-04T19:28:35Z
title: "Sophos UTM Up2date CLI"
tags:
  - "firewall"
  - "Linux"
  - "Networking"
description: "After buying some replacement UTM430's to replace the UTM525's the new 430's came in with some ancient firmware. As I've not got them plugged into the netw"
---
After buying some replacement UTM430's to replace the UTM525's the new 430's came in with some ancient firmware. As I've not got them plugged into the network right now I want to get them up to the same firmware as the current 525's. In our case the shipped firmware was 9.311 and the current 525's was 9.411. There's quite a few updates between those releases! Download the updates from: [ftp://ftp.astaro.com/pub/UTM/v9/up2date/](ftp://ftp.astaro.com/pub/UTM/v9/up2date/) We had to select to download individual files painstakingly version by version, there are some that can be skipped and these become obvious as you look at the files in the ftp folder. Look for the filename that matches your current version and find the highest version it will upgrade to. The file names are in the format:

    u2d-sys-[from]-[to].tgz.gpg

Where from is the version you are going from and to is the version it will upgrade to. In our case from 9.311003, to 312008 is the first step. Then you need to find 9.312008 with the highest 'to' version you can get eg. `u2d-9.312008-313003.tgz.gpg` So you need to make sure you grab related from, to files. In all I needed all of these:

    u2d-sys-9.311003-312008.tgz.gpg
    u2d-sys-9.312008-313003.tgz.gpg
    u2d-sys-9.313003-314013.tgz.gpg
    u2d-sys-9.314013-315002.tgz.gpg
    u2d-sys-9.315002-350012.tgz.gpg
    u2d-sys-9.350012-351003.tgz.gpg
    u2d-sys-9.351003-352006.tgz.gpg
    u2d-sys-9.352006-353004.tgz.gpg
    u2d-sys-9.353004-354004.tgz.gpg
    u2d-sys-9.354004-355001.tgz.gpg
    u2d-sys-9.355001-356003.tgz.gpg
    u2d-sys-9.356003-357001.tgz.gpg
    u2d-sys-9.357001-358003.tgz.gpg
    u2d-sys-9.358003-404005.tgz.gpg
    u2d-sys-9.404005-405005.tgz.gpg
    u2d-sys-9.405005-406003.tgz.gpg
    u2d-sys-9.406003-407003.tgz.gpg
    u2d-sys-9.407003-408004.tgz.gpg
    u2d-sys-9.408004-409009.tgz.gpg
    u2d-sys-9.409009-411003.tgz.gpg

Then it's a case of logon to the UTM CLI as root and mount your USB and copy the files into `/var/up2date/sys`

    # mkdir /mnt/usb
    # mount /dev/sdb1 /mnt/usb
    # cp -v /mnt/usb/*.gpg /var/up2date/sys

Then run the `up2date` process from the command line.

    # auisys.plx --verbose --upto 9.411003

This will take a while as it'll go through all of the `gpg` files in between the current release and the destination release. It may even fail to do it in a single process. So break it down and go `--upto` only a part way release like 9.35008. Then after it restarts repeat the up2date `--upto` with a higher version. auisys.plx can do more than install updates. You can test the files and simulate an up2date, read the files using showdesc and a few other things.

    # auisys.plx --verbose --simulation
    # auisys.plx --verbose --showdesc

### Restoring your Configuration

After a reboot and you now have the latest release (or the one matching the previous device) you can easily restore your config from the old system to the new. Simply backup an unencrypted version of your config from the old to a `.abf` file. Copy the `.abf` file to the root directory of a FAT32 formatted (non-bootable) USB stick. Then reboot the new UTM with the USB plugged in. The boot process will find the backup config and restore it as if by magic!

> Be aware that this will also replace the root password with the password from your previous UTM.

### References

[https://community.sophos.com/kb/de-de/115382](https://community.sophos.com/kb/de-de/115382) [https://community.sophos.com/products/unified-threat-management/f/hardware-installation-up2date-licensing/78310/up2date-firmware-release-explanation](https://community.sophos.com/products/unified-threat-management/f/hardware-installation-up2date-licensing/78310/up2date-firmware-release-explanation) [https://community.sophos.com/kb/en-us/121961](https://community.sophos.com/kb/en-us/121961)
