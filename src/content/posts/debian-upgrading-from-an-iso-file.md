---
pubDatetime: 2018-11-07T12:08:41Z
modDatetime: 2018-11-07T21:38:14Z
title: "Debian Upgrading from an ISO File"
tags:
  - "Linux"
  - "updates"
description: "Kind of an unusual situation, but I have a Debian jessie box that has a terrible <2MB Internet connection, no CD/DVD and the USB stick I have I don't want"
---
Kind of an unusual situation, but I have a Debian jessie box that has a terrible \<2MB Internet connection, no CD/DVD and the USB stick I have I don't want to overwrite and make bootable - it already has things on it I need. But it does have the capacity to hold the Debian DVD ISO \#1.

> How do you upgrade Debian from an ISO without being bootable?

## Mount the USB Sick

First mount the USB Drive into your stretch environment so you can use the ISO it contains. You may want to check the output of `dmesg` to see what device name your stick has been given.

    $ sudo mkdir /mnt/usb
    $ sudo mount /dev/sdb1 /mnt/usb

Now we can see the ISO in the `/mnt/usb` folder

    $ sudo ls -lh /mnt/usb

    total 12G
    -r-------- 2 root root 3.4G Nov 7 11:25 debian-9.5.0-amd64-DVD-1.iso

## Mount the ISO

We can then mount the ISO into another folder under `/mnt`

    $ sudo mkdir /mnt/iso

    $ sudo mount -t iso9660 -o loop /mnt/usb/debian-9.5.0-amd64-DVD-1.iso /mnt/iso

We have a mounted ISO

    $ sudo ls -lh /mnt/iso

    total 1.5M
    -r--r--r-- 1 root root 146 Jul 14 11:27 autorun.inf
    dr-xr-xr-x 1 root root 2.0K Jul 14 11:27 boot
    ...

## Edit Your Installation Sources

Next we edit the file `/etc/apt/sources.list` so it only contains the path to our ISO to install from. Take a copy of the original one or just comment out the existing lines.

    deb file:///mnt/iso stretch main contrib

You may also want to check any source list files under `sources.list.d` and move them out whilst you upgrade.

## Carry Out the Upgrade

Just continue as you normally would using upgrade/dist-upgrade to deliver your new OS. Making sure you do an update first so you read your news sources file.

    $ sudo apt-get update

    $ sudo apt-get upgrade

    $ sudo apt-get dist-upgrade

Because you're not getting the install from the internet and apt isn't able to trust the source, you will have to accept to install the upgrades by ignoring the security warning. *When you're done make sure you uncomment/put back the `sources.list` to point at the internet and replace the version with the new one eg. change jessie to stretch.*
