---
pubDatetime: 2020-03-02T07:45:00Z
modDatetime: 2020-03-01T14:54:20Z
title: "PXE Boot and Linux Mint"
tags:
  - "dhcp"
  - "Linux"
  - "nginx"
  - "pxe"
description: "Continuing the automated delivery saga Linux Mint is the thing that's giving me difficulties. There are a few quirks installing Linux Mint 19.3 Tricia that"
---
Continuing the automated delivery saga Linux Mint is the thing that's giving me difficulties. There are a few quirks installing Linux Mint 19.3 Tricia that really make it a not very good candidate for our needs.

A couple of things I've learned about the Linux Mint PXE boot deployment process means a change to require an Nginx server to serve the `d-i` folder structure. Mint doesn't seem to like using a `tftp://` url so I had to add a web service just to provide it with `http://`.

### additional_menu_entries

```
LABEL linuxmint-19.3-cinnamon-64bit
  MENU LABEL Linux Mint 19.3 64bit Cinnamon Desktop
  KERNEL /mint-installer/casper/vmlinuz
  APPEND initrd=/mint-installer/casper/initrd.lz root=/dev/nfs boot=casper netboot=nfs nfsroot=192.168.122.73:/srv/iso/mint-installer nosplash ubiquity-only automatic-ubiquity url=http://[IP Address]/d-i/tricia/preseed.cfg auto --
```

Also, the Mint image is huge 1.9GB as it has no netinst version. You need to download your own full iso, then extract the `casper` folder from it and place it into the `mint-installer` folder.

This also means I've had to provide an NFS file share that the Mint install can use to get at this whopper of an image. I installed NFS using:

```
$ sudo apt install nfs-kernel-server nfs-common
```

I created a symbolic link to the `mint-installer` folder:

```
$ sudo mkdir -p /srv/iso
$ cd /srv/iso
$ sudo ln -s [path to container set]/mint-installer
```

Then in my `/etc/exports`

```
/srv/iso/mint-installer (ro,sync,no_subtree_check)
```

**Important:** You must have the `casper` folder as a subfolder to the boot parameter `nfsroot=[IP Address]:/srv/iso/mint-installer` or you'll boot to initramfs with an error regarding missing boot arg `init=`.

eg.

```
mint-installer
└── casper
    ├── filesystem.manifest
    ├── filesystem.manifest-remove
    ├── filesystem.size
    ├── filesystem.squashfs
    ├── initrd.lz
    ├── memtest
    └── vmlinuz
```

Even after this I still have the problems with Keyboard selection and `openssh-server` as previously documented here: <https://warlord0blog.wordpress.com/2020/02/21/linux-mint-preseeding/>
