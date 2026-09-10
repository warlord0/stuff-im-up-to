---
pubDatetime: 2021-07-23T12:41:31Z
modDatetime: 2023-04-21T17:45:31Z
title: "LUKS Encryption and LVM"
tags:
  - "Linux"
  - "lvm"
  - "Security"
heroImage: "/blog-media/2017/02/download-10-e1488295217214.jpg"
description: "Setting up an encrypted boot volume is pretty straight forward at the time of installation. But what we wanted to do was add additional encrypted volumes e"
---
Setting up an encrypted boot volume is pretty straight forward at the time of installation. But what we wanted to do was add additional encrypted volumes either as a physical disk of as an LVM partition on the existing hardware.

During this process what I needed to understand was that a LUKS encrypted volume can have up to 8 passwords or more correctly, keys associated with it. This means I can have a passphrase that is known to sysadmins as one of the keys and another known by the user(s).

To mount volumes without asking users for the passphrase, one of the keys that I'm going to use is a file This file is stored in a location with permissions that is only accessible by root, and it is located on the encrypted `/boot` partition. This ensures that you will need to enter the encryption key at boot, but then the other volumes are mounted transparently.

## Creating the Encrypted Partition

Create an ext4 partition in the free space where we are going to use LVM. No need to format it as we're going to use it as an LVM physical volume (PV).

In this example I'm assuming we have space at `/dev/sda3` as 1 is the boot partition and 2 is the root.

Encrypt the newly created partition using cryptsetup.

```
sudo cryptsetup luksFormat --hash=sha512 --key-size=512 --cipher=aes-xts-plain64 --verify-passphrase /dev/sda3
```

Make a note of the passphrase used here, this will be our sysadmin passphrase.

Open the encrypted volume and create a mapped device that we can use.

```
sudo cryptsetup luksOpen /dev/sda3 sda3_crypt
```

We can name the mapped device whatever we like, in this case I used `sda3_crypt`.

## Setup LVM

Create the PV, eg.

```
sudo pvcreate /dev/mapper/sda3_crypt
```

Notice that we are creating the PV on the mapped device, NOT `sda3`. This is important because the mapped device only becomes available after you have opened it with `luksOpen`.

Create a volume group (VG) to create volumes in.

```
sudo vgcreate vg0 /dev/mapper/sda3_crypt
```

Now we can create and format volumes as we like:

```
sudo lvcreate --size=50G --name=data1 vg0
sudo mkfs.ext4 /dev/mapper/vg0-data1
sudo mkdir /mnt/data1
sudo mount /dev/mapper/vg0-data1 /mnt/data1
```

Get the device UUID.

```
sudo blkid /dev/mapper/vg0-data1                                                                                                     

/dev/mapper/vg0-data1: UUID="91e2a588-a11d-4546-9f43-46143e8e06b1" BLOCK_SIZE="4096" TYPE="ext4"
```

Edit your `/etc/fstab` to mount the volume at boot.

Add the line:

```
UUID="91e2a588-a11d-4546-9f43-46143e8e06b1" /mnt/data1 ext4 defaults,noatime 0 0
```

## Automate the Decryption

Now it's time to add the crypto details so the luks volumes are handled at boot.

Add a key file to a slot for the `sda3` volume by creating it from random content in root's home folder. This should be owned and exclusively accessible by root. It doesn't have to be in `/root`, but you MUST create it on the root partition. If you don't, it will probably be either in a place that is publicly accessible, and we don't want that, or it'll be on the encrypted volume that you're trying to decrypt. So keep it in `/root` or `/etc/`, but make sure it's restricted to the root user.

```
sudo dd if=/dev/urandom bs=32 count=1 of=/root/lukskey
sudo cryptsetup luksAddKey /dev/sda3 /root/lukskey
```

Get the UUID of the `sda3` partition.

```
sudo blkid /dev/sda3   
                                                                                                               
/dev/sda3: UUID="fedaae11-ad56-441c-a7dc-3eabd8ac1d8e" TYPE="crypto_LUKS" PARTUUID="63c74495-4370-8343-916f-f82980c0cd11"
```

Edit the file `/etc/crypttab` and add in the volumes we created with reference to the `lukskey` file we created.

```
sda3_crypt UUID=fedaae11-ad56-441c-a7dc-3eabd8ac1d8e /root/lukskey 
```

When we reboot we should find that after we enter the boot partitions password and Linux boots no further passwords are asked for and the LVM's are mounted as expected.

Using this approach, we can give the user(s) the ability to create their own LVM's without worrying about encryption, because the PV's are located on devices that are already encrypted.

## Managing Encryption Passphrases

In order to change a passphrase or key file you need to know one of the 8 stored keys. If you don't then you're in a world of hurt and a rebuild and restore from backup is probably in your future.

If you do know a passphrase to can change it:

```
sudo cryptosetup luksChangeKey /dev/sda3
```

You will be asked for the passphrase to change. This is only really any use if you know the one you are changing. What you probably have is a passphrase that you don't know. In which case you can only clear a slot and replace it with a new passphrase.

```
sudo cryptosetup luksKillSlot /dev/sda3 0
```

This will destroy they key held in slot 0. But you still must know an existing passphrase to do this.

Listing what key slots are used:

```
sudo cryptsetup luksDump /dev/sda3
```

> **IMPORTANT**: Set a sysadmin passphrase and **DO NOT** forget it.
