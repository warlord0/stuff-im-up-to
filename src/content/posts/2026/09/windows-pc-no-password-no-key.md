---
pubDatetime: 2026-09-23T21:09:07Z
title: "Recovering a Windows PC With No Password and No Product Key"
tags:
  - "Windows"
  - "manjaro"
  - "ntfs"
  - "BitLocker"
heroImage: "/blog-media/2026/09/windows-recovery-header.webp"
heroThumb: "/blog-media/2017/12/windows-icon-thumb.webp"
description: "A family member passed away and left a custom-built Windows PC with no known password and, being custom-built, almost certainly no OEM key sticker either. Here's how to check for a firmware-embedded key, identify the Windows edition offline, clear a forgotten local account password, and understand whether you'll need to buy a new licence at all."
---

A family member of mine passed away recently and left behind a custom-built PC. Nobody has the login password, and since it's a custom build rather than something off a shelf, there was never a product key sticker to fall back on either. The plan is to get it working again and pass it on to my nephew for school work - the school is very Microsoft-orientated, so as much as I'd love to hand him a Linux box, it had to stay Windows.

Everything below was done from a Manjaro live USB, with the PC's own drives never plugged into anything else.

## Checking for a Firmware-Embedded Key

If Windows still boots, PowerShell (as Administrator) will show an OEM key baked into the firmware, if one exists:

```
(Get-CimInstance -ClassName SoftwareLicensingService).OA3xOriginalProductKey
```

Without a working Windows install, the same information - if it's there at all - lives in the ACPI `MSDM` table, which Linux exposes read-only:

```
sudo strings /sys/firmware/acpi/tables/MSDM
```

If that file doesn't exist, check the table listing directly rather than trusting a single guess at the path:

```
sudo ls /sys/firmware/acpi/tables | grep -i msdm
```

and confirm you're actually booted in UEFI mode, since `MSDM` is a UEFI-only mechanism:

```
[ -d /sys/firmware/efi ] && echo "UEFI" || echo "Legacy BIOS"
```

No `MSDM` table doesn't automatically mean no valid licence. Modern Windows is commonly activated through a **digital licence** tied to the motherboard rather than a 25-character key typed in at install time, and Microsoft's own guidance is that reinstalling doesn't always need a key at all. It just means there's nothing to physically extract - the licence, if it exists, lives on Microsoft's activation servers against a hardware fingerprint.

## Finding the Windows Partition(s)

From the live USB, `lsblk -f` lists every disk without touching any of them:

```
lsblk -f
```

A Windows installation has a recognisable shape: a small FAT32 EFI system partition, a 16MB Microsoft Reserved partition, one large NTFS partition, and a smaller NTFS recovery partition. In this case there were two internal drives with exactly that layout - the PC had clearly had more than one Windows install over its life, possibly from an earlier disk that was never removed.

Before mounting anything, check the filesystem type of each candidate partition:

```
sudo blkid /dev/sdb3 /dev/sdc3
```

`ntfs` is good news - it means it isn't BitLocker-encrypted and you can read it. `BitLocker` or `BitLocker member` means it is, and without the 48-digit recovery key (normally backed up to a Microsoft account, a printed copy, or an organisation's records) the data is unrecoverable. If that had been the case here, the only realistic option would have been to accept the files were gone and do a clean install onto the unallocated space instead.

With `ntfs` confirmed, mount read-only so nothing on the drive can change:

```
sudo mkdir -p /mnt/sdb3 /mnt/sdc3
sudo mount -o ro /dev/sdb3 /mnt/sdb3
sudo mount -o ro /dev/sdc3 /mnt/sdc3
```

## Working Out Which Install Is the Real One

With two Windows-shaped drives, one turned out to contain a `Windows.old` folder alongside the usual `Windows`, `Users` and `Program Files` - a strong sign that drive had been upgraded or reinstalled on top of itself at some point, and is the more recent one. Directory timestamps can help too, though mounting the volume at all resets access times, so lean on modification times instead:

```
stat /mnt/sdb3/Windows
stat /mnt/sdc3/Windows
```

The reliable way to settle it is to read the edition straight out of the offline registry.

## Reading the Windows Edition Offline

`chntpw` reads (and can edit) Windows registry hives directly from Linux:

```
# Debian/Ubuntu live media
sudo apt install chntpw
# Manjaro
sudo pacman -S chntpw
```

Two things caught me out here. First, Windows itself is case-insensitive about the hive's filename, but Linux isn't, and on one of the two drives the file was genuinely lowercase on disk:

```
ls -la /mnt/sdb3/Windows/System32/config
# SOFTWARE on one install, software on the other
```

Second, `chntpw` wants to open the hive in a mode that needs write access, which a read-only mount won't give it - even though all you want to do is read a value. Copy the hive out to the live system's own writable `/tmp` first, and work on the copy:

```
cp /mnt/sdb3/Windows/System32/config/software /tmp/software-sdb
chntpw -e /tmp/software-sdb
```

At the `>` prompt:

```
cd Microsoft\Windows NT\CurrentVersion
cat ProductName
cat DisplayVersion
cat CurrentBuild
q
```

That turned up **Windows 10 Home, 20H2, build 19042** on the older drive - three fields that all agree with each other, genuinely Windows 10. The other drive, the one with `Windows.old`, was less trustworthy: `ProductName` also said "Windows 10 Pro", but `DisplayVersion` said `23H2` and `CurrentBuild` said `22631` - a real Windows 11 23H2 build, since Windows 10 never went past 22H2. `ProductName` doesn't always get rewritten correctly when a Windows 10 install is upgraded in place to 11, so treat it as unreliable once you've already caught it being wrong about the major version - the "Pro" half of the same string is no more trustworthy than the "10" half. The edition matters for a reinstall, since Windows won't reactivate a Home licence against a Pro installation or vice versa, so it's worth being sceptical of a reading like this rather than taking it at face value.

## Clearing a Forgotten Local Account Password

Local account passwords live in the `SAM` hive, in the same folder as `SOFTWARE`. As before, never touch the original directly - copy it out first:

```
cp /mnt/sdc3/Windows/System32/config/SAM /tmp/SAM-sdc
sudo chntpw -l /tmp/SAM-sdc
```

That lists every local account with its RID and whether it's an administrator:

```
| RID -|---------- Username ------------| Admin? |- Lock? --|
| 01f4 | Administrator                  | ADMIN  | dis/lock |
| 01f7 | DefaultAccount                 |        | dis/lock |
| 01f5 | Guest                          |        | dis/lock |
| 03e9 | User                           | ADMIN  | dis/lock |
| 01f8 | WDAGUtilityAccount             |        | dis/lock |
```

`User` was the one actually in use, and an administrator, so:

```
sudo chntpw -u 'User' /tmp/SAM-sdc
```

The interactive menu can blank the password on that copy. A few things worth knowing before you do this:

- It only works on a **local** Windows account, not one signed in with a Microsoft account.
- It won't touch a Windows Hello PIN, which is a separate mechanism from the account password.
- Blanking the password can make any files protected with EFS unreadable.
- Do this only when you're actually entitled to access the machine - inheriting it, owning it, or otherwise having the authority to. This is exactly why BitLocker, or simply not leaving a PC logged out and unattended, matters: local physical access and a live USB is genuinely most of what's needed to get past a forgotten local password.

## Getting the Edited Hive Back Onto the Disk

Editing `/tmp/SAM-sdc` doesn't touch Windows until it's copied back - and doing that means mounting the partition read-write, which is where this got interesting:

```
sudo mount -t ntfs-3g -o rw /dev/sdc3 /mnt/sdc3
```

```
Windows is hibernated, refused to mount.
Falling back to read-only mount because the NTFS partition is in an
unsafe state. Please resume and shutdown Windows fully (no hibernation
or fast restarting.)
```

Windows' Fast Startup feature hibernates the kernel session on "shutdown" rather than actually shutting down, and both the in-kernel `ntfs3` driver and `ntfs-3g` refuse a read-write mount while that hibernation image is in place, to avoid corrupting the filesystem. Since there's no way to boot Windows to shut it down properly, the practical option is to discard that saved session:

```
sudo mount -t ntfs-3g -o rw,remove_hiberfile /dev/sdc3 /mnt/sdc3
```

`remove_hiberfile` deletes `hiberfil.sys` - the suspended session - not any actual files on disk. It's the right call when you need to modify an offline Windows installation and have no way to resume that session anyway; it would be the wrong call if resuming that exact session mattered.

With the partition mounted read-write, copy the edited hive back and unmount cleanly:

```
sudo cp /tmp/SAM-sdc /mnt/sdc3/Windows/System32/config/SAM
sync
sudo umount /mnt/sdc3
```

Reboot, remove the USB, and the account should now accept a blank (or newly set) password.

## What About the Product Key?

`DigitalProductId` in the registry is encoded binary, not a decodable 25-character key, and `ProductId` isn't the activation key either - `chntpw` can show you both, but neither is directly useful:

```
chntpw -e /tmp/software-sdc
cd Microsoft\Windows NT\CurrentVersion
cat ProductId
cat DigitalProductId
```

Once you can actually boot into Windows, the real answer is in Settings → System → Activation, or from an admin Command Prompt:

```
slmgr /dlv
```

That reports the activation channel. If it comes back as a digital licence, there's no product key to go looking for - and that's fine. The practical test came when the family later sourced a replacement 1TB SSD for the machine: installing Windows 11 **Home**, not Pro, and choosing "I don't have a product key" was enough. Once it was online, it activated automatically against the same motherboard, with no need for the original Microsoft account at all - the account only matters if the licence was tied to it instead of the hardware, or if you're moving it to different hardware entirely.

That also confirmed which of the two offline registry readings to trust: the self-consistent Windows 10 Home reading from the older drive, not the contradictory "Windows 10 Pro" / build 22631 one from the drive with `Windows.old`. When two readings disagree and one of them is already internally inconsistent, believe the consistent one.

## References

[Windows activation troubleshooting - Microsoft](https://support.microsoft.com/en-us/windows/activate-windows-c39005d4-95ee-b91e-b399-2820fda32227)

[chntpw](https://pogostick.net/~pnh/ntpasswd/)

[NTFS-3G](https://github.com/tuxera/ntfs-3g)

See also: [Installing Windows 11 Home: A Rant](/posts/installing-windows-11-home-a-rant/)
