---
pubDatetime: 2025-06-22T13:05:56+00:00
title: "Manjaro Kernel Fix Guide"
tags:
  - "Linux"
  - "Grub"
  - "Kernel"
  - "Manjaro"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "I managed to break my Manjaro installation on my home server. The updates failed on me part way through and the terminal died. I had to resort to a repair from a live USB sick. When Manjaro breaks during updates and shows \"need to load kernel first\" error. 1. Boot from Live USB/ISO Create a…"
---
I managed to break my Manjaro installation on my home server. The updates failed on me part way through and the terminal died. I had to resort to a repair from a [live USB sick](https://warlord0blog.wordpress.com/2023/01/31/ventoy-one-stick-to-boot-them-all/).

When Manjaro breaks during updates and shows “need to load kernel first” error.

## 1. Boot from Live USB/ISO

Create a Manjaro live USB and boot from it.

## 2. Network Setup (needed for access to repositories)

### Check network status

```
ip addr show
ping -c 3 8.8.8.8
```

### Manual network configuration (if automatic setup fails)

#### Set IP address

```
# Replace eth0/wlan0 with your interface name
# Replace 192.168.0.201 with desired IP
# Replace 192.168.0.1 with your router IP
sudo ip addr add 192.168.0.201/24 dev eth0
sudo ip link set eth0 up
```

#### Set default route

```
# Replace 192.168.0.1 with your router/gateway IP
sudo ip route add default via 192.168.0.1
```

#### Set DNS servers

```
# Set Cloudflare DNS
echo -e "nameserver 1.1.1.1\nnameserver 1.0.0.1" | sudo tee /etc/resolv.conf

# Or Google DNS
echo -e "nameserver 8.8.8.8\nnameserver 8.8.4.4" | sudo tee /etc/resolv.conf
```

#### Verify connectivity

```
ping -c 3 archlinux.org
```

### Alternative: Using NetworkManager

```
# List connections
nmcli connection show

# Set DNS for connection (replace "connection-name")
nmcli connection modify "connection-name" ipv4.dns "1.1.1.1,1.0.0.1"
nmcli connection up "connection-name"
```

## 3. Mount and Chroot

### Identify partitions

```
sudo fdisk -l
lsblk
```

### Mount root partition

```
# Replace /dev/sdXY with your root partition
sudo mount /dev/sdXY /mnt

# Mount boot partition if separate (replace /dev/sdXZ)
sudo mount /dev/sdXZ /mnt/boot

# Mount EFI partition if using UEFI (usually /dev/sdX1)
sudo mount /dev/sdX1 /mnt/boot/efi
```

### Chroot into system

```
sudo manjaro-chroot /mnt
```

## 4. Fix Pacman Database

### Clear pacman lock

```
sudo rm /var/lib/pacman/db.lck
```

### Fix corrupted database

```
# Verify database integrity
sudo pacman-db-upgrade

# If that fails, refresh databases
sudo rm -rf /var/lib/pacman/sync/*
sudo pacman -Sy
```

### Check for partial upgrades

```
sudo pacman -Suu
```

## 5. Reinstall Kernel

### Check available kernels

```
mhwd-kernel -li
```

### Install/reinstall kernel

```
# For LTS kernel
sudo pacman -S linux612 linux612-headers

# For current stable
sudo pacman -S linux614 linux614-headers

# For latest (replace version as needed)
sudo pacman -S linux614 linux614-headers

# Install multiple kernels for backup
sudo pacman -S linux614 linux614-headers linux612 linux612-headers
```

### Update bootloader

```
# For GRUB
sudo update-grub

# For systemd-boot
sudo bootctl update

# For rEFInd
sudo refind-install
```

## 6. Exit and Reboot

```
exit
sudo umount -R /mnt
sudo reboot
```

## Troubleshooting

### If pacman is completely broken

```
# Download and extract pacman manually
wget http://mirror.archlinux.org/core/os/x86_64/pacman-6.0.2-7-x86_64.pkg.tar.zst
sudo tar -xf pacman-*.pkg.tar.zst -C /
```

### If GRUB doesn’t show multiple kernels

```
# From chroot, reinstall GRUB
sudo grub-install /dev/sdX  # Replace X with your disk (not partition)
sudo update-grub
```

### If still can’t boot

- Try selecting older kernel from GRUB advanced options
- Check `/var/log/pacman.log` for what went wrong during update
- Consider reinstalling bootloader completely

## Prevention Tips

- Always install multiple kernels: `sudo pacman -S linux54 linux61`
- Don’t interrupt system updates
- Keep live USB handy for emergencies
- Regular backups with timeshift or similar

## Useful Commands

```
# Check current kernel
uname -r

# List installed kernels
mhwd-kernel -li

# Check boot entries
sudo efibootmgr  # UEFI systems
```
