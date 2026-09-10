---
pubDatetime: 2024-07-31T09:28:06Z
title: "Unlocking a LUKS partition with a USB stick"
tags:
  - "Linux"
  - "luks"
  - "Security"
heroImage: "/blog-media/2018/10/computer-code.jpg"
description: "Linux Unified Key Setup LUKS in an “at rest” encryption method for Linux disk media. Once a drive is encrypted using LUKS you will need the password or key"
---
## Linux Unified Key Setup

LUKS in an “at rest” encryption method for Linux disk media. Once a drive is encrypted using LUKS you will need the password or key to decrypt and use the system.

The password is usually asked for at boot. LUKS can support multiple passwords, pass files, even a mixture of the two. It is also possible with some effort to use a TPM.

## Unlocking a LUKS partition with a USB stick

The objective is to be able to start a Linux system without requiring a user to enter the LUKS password at boot. It means that the partition is encrypted is totally reliant upon the USB stick to be connected in order for the system to boot.

### The Process

Install the OS with a LUKS password protected partition using the installation time options. Keep a record of this password.

Once installed, insert a (FAT formatted) USB stick. It only needs to be very small - 10MB is more than enough. It’s literally a 4k file.

Create a random key file on the USB stick partition using `dd`.

Add the key file to the `cryptsetup` of the encrypted partition.

Edit `/etc/crypttab` to tell it how to access the USB key file.

Update `initramfs` so it knows to mount the USB stick at boot and fetch the key file to unlock the volume.

#### Mount the USB Stick

Mount the USB partition into `/mnt`.

`sudo mount /dev/sdb1 /mnt`

#### Generate a UUID for the Key Filename

`uuid`

Copy the generated UUID use it in future references to `[uuid]`

Install the `uuid` program if you don’t have it.

`sudo apt install uuid`

#### Create a Random Key File

`sudo dd if=/dev/urandom of=/mnt/[uuid].lek bs=4096 count=1`

This should create the file `[uuid].lek`

#### Add the Key to the Encrypted Partition

`sudo cryptsetup luksAddKey /dev/sda3 /mnt/[uuid].lek`

Where `/dev/sda3` should be your encrypted partition. You can confirm this by using:

`sudo blkid --match-token TYPE=crypto_LUKS -o device`

#### Create the /bin/luksunlockusb File

Create the file and make sure you make it executable with `chmod +x`.

```
#!/bin/sh
set -e
if [ ! -e /mnt ]; then
    mkdir -p /mnt
    sleep 3
fi
for usbpartition in /dev/disk/by-id/usb-*-part1; do
    usbdevice=$(readlink -f $usbpartition)
    if mount -t vfat $usbdevice /mnt 2>/dev/null; then
        if [ -e /mnt/$CRYPTTAB_KEY.lek ]; then
            cat /mnt/$CRYPTTAB_KEY.lek
            umount $usbdevice
            exit
        fi
        umount $usbdevice
    fi
done
/lib/cryptsetup/askpass "Insert USB key and press ENTER: "
```

#### Edit /etc/crypttab

`sudo vi /etc/crypttab`

Make changes to include the new `[uuid]` and `keyscript`. **DO NOT** change the first part `dm_crypt-0 UUID=` and the following UUID.

Originally, it should look like this:

`dm_crypt-0 UUID=57d3e7b0-d513-4b18-9ba4-8531a25999f4 none luks,discard`

We only want to update/replace the ending `none luks,discard`:

`dm_crypt-0 UUID=57d3e7b0-d513-4b18-9ba4-8531a25999f4 [uuid] luks,discard,keyscript=/bin/luksunlockusb`

This is where you use the UUID you got from above, when you created the filesystem on the USB.

> **CAUTION:** This is critical you get it right. Pay attention to what you are doing, double and triple check you got the right UUID. Whilst errors can be fixed, it’s not a simple process.

#### Update initramfs

Initramfs holds the initial boot environment. You are updating it with the `crypttab` you created above. Once updated, is will cause the system to boot only if it finds the USB stick with the UUID you put into `crypttab`. This means that if you got it wrong, you cannot boot the system, as it no longer waits for a user to enter a password.

The only way to fix it is to boot into another Linux from USB stick, manually mount the encrypted volume (thankfully you documented the password, right?). Then you must `chroot` to retry updating initramfs.

`sudo update-initramfs -k all -u`

> **WARNING**: If you get any errors now is the time to go back and double check `crypttab` and other settings. **DO NOT** reboot until you re-reun `update-initramfs` without errors.

Now when you reboot, and you have the USB stick connected, it should just boot into Linux without asking for a password. If you remove the USB, and reboot, you can still use the password.

## References

On ANY USB Stick, [LUKS with USB unlock](https://tqdev.com/2022-luks-with-usb-unlock)

[Unlocking a LUKS-encrypted partition on boot with an USB drive](https://blog.fidelramos.net/software/unlock-luks-usb-drive)

When things go wrong: <https://forums.debian.net/viewtopic.php?t=143279>

[LUKS recovery from initramfs shell](https://tqdev.com/2023-luks-recovery-from-initramfs-shell)
