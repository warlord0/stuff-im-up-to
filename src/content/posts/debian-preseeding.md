---
pubDatetime: 2020-02-20T20:19:38Z
title: "Debian Preseeding"
tags:
  - "dhcp"
  - "Linux"
description: "The boss walked in today with a new desktop PC for a new staff member and handed it off saying: \"I hope we aren't going to be using some antiquated process"
---
The boss walked in today with a new desktop PC for a new staff member and handed it off saying:

> "I hope we aren't going to be using some antiquated process to install this?"

As a desktop installation hasn't been a regular thing for me I thought I'd look at automating the delivery and put into practice some of the automation I've been working with. Time to look at 'preseeding' the Debian install and tidying it all up with a post install process using ansible.

My end goal was to get a desktop installed with authentication using the LDAP client configured for our LAN and to install, and remove some corporate wide applications.

[Debian preseeding](https://wiki.debian.org/DebianInstaller/Preseed) uses a text based configuration file that automatically answers the questions the installer would ask in manual mode. You just grab hold of the preseed file for your version and modify the entries as you need.

In my case I'm using Debian Buster so I grab the file [https://www.debian.org/releases/buster/example-preseed.txt](https://www.debian.org/releases/buster/example-preseed.txt). It's heavily commented so it helps you answer the questions you need.

With all the comments stripped out this is what I ended up with:

```
d-i debian-installer/locale string en_GB
d-i keyboard-configuration/xkb-keymap select uk
d-i netcfg/choose_interface select auto
d-i netcfg/get_hostname string unassigned-hostname
d-i netcfg/get_domain string unassigned-domain
d-i netcfg/wireless_wep string
d-i mirror/country string manual
d-i mirror/http/hostname string deb.debian.org
d-i mirror/http/directory string /debian
d-i mirror/http/proxy string
d-i passwd/root-password-crypted password $1$vd3HwwlC$TMx6sD13bGclrY1aEGUaZ.
d-i passwd/username string sysconfig
d-i passwd/user-password-crypted password $1$h3ZHbphO$nkoDkO/3Re4hQY/ttnfWH.
d-i passwd/user-uid string 7000
d-i passwd/user-default-groups string audio cdrom video sudo wheel
d-i clock-setup/utc boolean true
d-i time/zone string Europe/London
d-i clock-setup/ntp boolean true
d-i clock-setup/ntp-server string ntp.domain.tld
d-i partman-auto/disk string /dev/sda
d-i partman-auto/method string lvm
d-i partman-auto-lvm/guided_size string max
d-i partman-lvm/device_remove_lvm boolean true
d-i partman-md/device_remove_md boolean true
d-i partman-lvm/confirm boolean true
d-i partman-lvm/confirm_nooverwrite boolean true
d-i partman-auto/choose_recipe select home
d-i partman-partitioning/confirm_write_new_label boolean true
d-i partman/choose_partition select finish
d-i partman/confirm boolean true
d-i partman/confirm_nooverwrite boolean true
d-i partman-md/confirm boolean true
d-i partman-partitioning/confirm_write_new_label boolean true
d-i partman/choose_partition select finish
d-i partman/confirm boolean true
d-i partman/confirm_nooverwrite boolean true
d-i partman/mount_style select uuid
tasksel tasksel/first multiselect standard, gnome-desktop
d-i pkgsel/include string openssh-server build-essential sudo zsh curl git
d-i grub-installer/only_debian boolean true
d-i grub-installer/with_other_os boolean true
d-i finish-install/reboot_in_progress note
```

As this file will get placed onto an open web server it's best not to store the passwords in here as plain text. I generated hashes using `openssl` like this:

```
$ openssl passwd -1
```

I brought up an Nginx server on my PC and placed my `preseed.cfg` file into it's `/var/www/html` folder which is it's document root. Then it can be accessed using `http://mypcaddress/preceed.cfg`. This is good enough, but let's expand on what if I had another version of Debian to do? Using the following structure you can see that buster gets served from the buster folder - you can guess the rest.

```
html
└── d-i
    └── buster
        └── preeseed.cfg
```

## Usage

Couldn't be simpler (well it could really). Boot your install target PC from your netinst prepared USB boot stick or CD or DVD, etc. Choose Advance options from the menu and then use Automated install.

The PC will start the installation booting with DHCP and go through the motions until you are asked where your preseed file is. Point it at your Nginx PC - `http://mypcaddress` - no need for a path and filename if you placed it as above. The install will then just whirr away and finish by rebooting the PC ready to use!

> In my case I did get stopped and asked one critical question. Becasue the PC already had Windows installed using UEFI I had to confirm I wanted to overwrite the UEFI configuration.

The next steps are to move the Nginx setup onto a corporate server rather than my PC and then add a DNS entry called `preseed` pointing to my Nginx instance. Then I can just type `preseed` into the installation prompt. But then I can go a step further and remove the prompt (see [](https://www.debian.org/releases/stable/i386/apbs02.en.html)<https://www.debian.org/releases/stable/i386/apbs02.en.html>), by adding a DHCP option that tells the boot process to use my `preseed` address without asking.

> As expected it looks like other Debian based distros have the same capability. This means with a bit of work we can probably do this for Ubuntu or Mint.

Now I have a speedy process to deploy a desktop it is going to need a bit more customisation to get it how I like. I want to remove all the games and configure my LDAP authentication, add my ssh keys to make remote management easier and a few other niceties - for that I'm ready with ansible in a follow up article...
