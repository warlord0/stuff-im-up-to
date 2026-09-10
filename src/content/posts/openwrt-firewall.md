---
pubDatetime: 2021-06-23T20:26:29Z
modDatetime: 2022-02-13T14:25:31Z
title: "OpenWrt Firewall"
tags:
  - "firewall"
  - "Linux"
  - "Security"
heroImage: "/blog-media/2021/06/openwrt.png"
description: "I've inherited a couple of OpenWrt firewalls that need some upgrades. They're not hugely outdated, only a major version behind. I need to figure out the up"
---
I've inherited a couple of OpenWrt firewalls that need some upgrades. They're not hugely outdated, only a major version behind. I need to figure out the upgrade path.

First off, I need to do some testing. Let's build a few KVM's running OpenWrt and try a few things out.

To get openwrt onto a kvm I need to download the img file extract it and mount it as the primary disk for the guest. I also need to create a separate volume for the configuration and writable data. Then I want to make sure I have the same number of interfaces available to deliver the existing configuration into.

I know I have four interfaces on the existing build. I need to create four interfaces on the virtual machine. For this I create virtual networks and for the tests I'm not really bothered about actual networks and IP's, I just want something to attach the virtual machine to.

I created four files with subtle changes that would create networks in virsh, eg.

```
<network>
  <name>net0</name>
  <uuid>c1e2e831-0d5c-4c5d-ad76-45cfd10236a8</uuid>
  <forward mode='nat'/>
  <bridge name='net0' stp='on' delay='0'/>
  <mac address='52:54:00:43:01:00'/>
  <ip address='192.168.100.1' netmask='255.255.255.0'>
    <dhcp>
      <range start='192.168.100.2' end='192.168.100.254'/>
    </dhcp>
  </ip>
</network>
```

I need to make sure that the uuid, bridge name, mac address and IP addresses are all unique and save them as `net0.xml...net3.xml`. Then create them using virsh.

```
sudo virsh net-create net0.xml
```

Time to download the images I need from openwrt. I want 18.0.06.1 which is what I have now, and 19.07.7 as that's what I plan to upgrade to.

[https://downloads.openwrt.org/releases/18.06.1/targets/x86/64/](https://downloads.openwrt.org/releases/18.06.1/targets/x86/64/)

You'll find the images under the `/releases/[version]/targets/x86/64` and the files names `combined-ext4.img.gz`. Once downloaded, they need to be decompressed ad resized, so they can be mounted as raw disks into the virtual machine.

Copy the gzip file into the virtual machine pools location and resize it.

```
gunzip openwrt-18.06.1-x86-64-combined-ext4.img.gz
qemu-img resize openwrt-18.06.1-x86-generic-combined-ext4.img 300M
```

I had some trouble resizing the partition after this. Although `fdisk` showed I had a 300M disk, it failed to resize using `resize2fs`. As a workaround, I mounted the raw image in another virtual machine and used `parted` to resize and then `resize2fs`.

Then I'm ready to build my new guest with virt-manager. I chose a manual build using Generic Linux 2020. When you get to disks, select the decompressed image file from the pool (refresh if required).

At the end of the setup, choose to edit the configuration before launching the image. It's at the config edit point you can add on the second disk under storage - even a .01 GB volume should do - unless you have bigger plans. Then add in the four networks you created too as NAT.

Then start you machine. It should boot and go through a few openwrt checks before it arrives at the pint of functionality. Check the IP addresses on your interfaces using `ip a`, and add any IP addresses you may need to connect to the management interface. Typically, I found I had to add an IP address to the br-lan interface in the range of my default virtual network, eg.

```
ip addr add 192.168.122.221/24 dev br-lan
```

Then I could browse to `http://192.168.122.221` and logon as `root` with no password.

I then repeated the build process with 19.07.7 with a different default IP address.

## Testing

My first test was to backup the config from my existing version 18 device and try to restore it on each of my new virtuals. This went perfectly. They both took the config and rebooted. Now with the same root password as the device the config came from. I also had to double-check my IP addresses as the interfaces have changed. So I added my default virtual network IP address to the management interface.

Now I have both an 18 and a 19 build that have the same config. This means I could just build a new firewall and deliver the old config to it and I would have a working system.

My next test was to reuse the 19.07.7 gzipped image file from above and deliver it to the vm running 18. I logged into the version 18 vm and under menu System. Backup / Flash Firmware uploaded the 19 gzip file. After a confirmation, the vm rebooted and started up in less than a minute as version 19.07.7! A very slick and easy upgrade.
