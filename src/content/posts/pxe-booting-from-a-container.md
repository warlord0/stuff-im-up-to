---
pubDatetime: 2020-02-29T14:12:01Z
modDatetime: 2020-03-04T21:58:27Z
title: "PXE Booting from a Container"
tags:
  - "dhcp"
  - "dnsmasq"
  - "Linux"
  - "pxe"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "I wanted to build on the automated deployments for Debian and Mint, etc. and the next logical step is to use a PXE boot server and DHCP. Thankfully someone"
---
I wanted to build on the automated deployments for Debian and Mint, etc. and the next logical step is to use a PXE boot server and DHCP. Thankfully someone has already built a container to do just that - [ferrarimarco/pxe](https://hub.docker.com/r/ferrarimarco/pxe)

Now all I have to do it get my Debian boot image injected into this.

## dnsmasq

It ended up being pretty straight forward. Setup the docker-compose as follows:

```
version: '3'

services:
  pxe:
    image: ferrarimarco/pxe
    volumes:
      - ${PWD}/debian-installer/:/var/lib/tftpboot/debian-installer/:ro
      - ${PWD}/additional_menu_entries:/var/lib/tftpboot/pxelinux.cfg/additional_menu_entries:ro
      - ${PWD}/d-i/:/var/lib/tftpboot/d-i:ro
      # - ${PWD}/dnsmasq.d/dnsmasq.conf:/etc/dnsmasq.conf:ro
    network_mode: "host"
    entrypoint:
      - "dnsmasq"
      - "--no-daemon"
      - "--dhcp-range=192.168.122.10,192.168.122.19"
      - "--dhcp-broadcast"
      - "--domain=domain.tld"
      - "--dhcp-option=3,192.168.122.1"
      - "--dhcp-option=6,8.8.8.8"
```

The `--dhcp-broadcast` is an important option. Without it it fails to give out an IP address (see [https://github.com/ferrarimarco/docker-pxe/pull/21#issuecomment-515686208](https://github.com/ferrarimarco/docker-pxe/pull/21#issuecomment-515686208))

Also edit the `dhcp-options` to suit your environment.

```
--dhcp-option=3, # This is your default route
--dhcp-option=6, # This is your DNS server
```

## netboot

I then created the file `additional_menu_entries` and put the boot options for Debian into it.

```
LABEL debian-10-amd64 Gnome Desktop
  MENU LABEL Debian 10 amd64 Gnome Desktop
  KERNEL /debian-installer/amd64/linux
  APPEND auto=true priority=critical vga=788 initrd=/debian-installer/amd64/initrd.gz DEBCONF_DEBUG=5 url=tftp://192.168.122.73 --
LABEL debian-10-amd64 CLI
  MENU LABEL Debian 10 amd64 CLI
  KERNEL /debian-installer/amd64/linux
  APPEND auto=true priority=critical vga=788 initrd=/debian-installer/amd64/initrd.gz DEBCONF_DEBUG=5 url=tftp://192.168.122.73/d-i/buster/preseed-cli.cfg --
```

This mounts and overwrites the one inside the container.

Next it's time to grab the files from Debian's netboot - [https://www.debian.org/distrib/netinst#netboot](https://www.debian.org/distrib/netinst#netboot)

You'll want to use an FTP client to pull the whole structure from [http://ftp.debian.org/debian/dists/buster/main/installer-amd64/current/images/netboot/debian-installer/amd64/](http://ftp.debian.org/debian/dists/buster/main/installer-amd64/current/images/netboot/debian-installer/amd64/)

```
$ wget -r -nH --cut-dirs=9 http://ftp.debian.org/debian/dists/buster/main/installer-amd64/current/images/netboot/debian-installer/amd64/
$ # Tidy up the amd64 folder
$ find amd64/ -iname 'index.html*' -exec rm {} \;
```

You can then put the `amd64` folder into the `debian-installer` folder and you'll have everything you need to boot a Debian install and complete a network install pulling from a mirror.

## Preseeding

Adding the preseeding part to this is very straight forward. We need to boot the installer with the options `auto=true priority=critical url=tftp://192.168.122.73` where the IP address represents the IP address of our docker host (not the container). You'll see these options are included in the `additional_menu_entries` shown above.

From my previous post Debian Preseeding you note we could pull the preseed files from a http server. Well we can also pull them from a tftp server - which is exactly what the dnsmasq service provides. All we need to do is create our `d-i` structure and mount it into the services volume `/var/lib/tftpboot/d-i` folder. You'll notice this is in the menu entry above `url=tfpt://...`.

> When the client boots using PXE and selects the Gnome or CLI version the Debian install is fully automated - no questions are asked unless they are "critical". So be wary booting this way as no questions about overwriting your hard drive will be asked. It will overwrite everything with a fresh install as per your `preseed.cfg` or `preseed-cli.cfg` files.
>
> IMPORTANT

In a virtual environment the only question I got asked was about where to install grub. I suspect this is because normally the install would go onto the first disk `/dev/sda`, but in libvirt/qemu this is `/dev/vda`.

## References

<https://warlord0blog.wordpress.com/2020/02/20/debian-preseeding/>
