---
pubDatetime: 2026-09-26T16:13:41Z
title: "LVM Volume Still Showing After Removing the Disk"
tags:
  - "lvm"
  - "manjaro"
heroImage: "/blog-media/2026/09/manjaro-header.webp"
heroThumb: "/blog-media/2021/01/manjaro-thumb.webp"
description: "A 54GB LVM volume kept showing up in Nautilus as mountable, weeks after I'd unmounted it and physically removed the disk it lived on. pvs, vgs and lvs all said there was nothing there. The real answer was one level lower, in device-mapper."
---

I had a 54GB LVM volume showing up in Nautilus's sidebar as available to mount. I'd unmounted it and physically removed the disk it lived on ages ago. It shouldn't have existed any more, let alone been offering to mount.

## Ruling Out a GVfs Cache Issue

First thing to check: is this actually a live block device, or just a stale bookmark/thumbnail cache from GVfs?

```
gio mount -li
```

That came back with a real entry:

```
Volume(0): 54 GB Volume
  Type: GProxyVolume (GProxyVolumeMonitorUDisks2)
  ids:
   class: 'device'
   unix-device: '/dev/dm-3'
   uuid: 'a03f571c-128f-48e7-a113-db7b3c9ee597'
  can_mount=1
```

So it's not cache. `udisks2` is reporting a genuine device node, `/dev/dm-3`, with a real filesystem UUID on it.

## LVM Itself Sees Nothing

`dm-3` being a device-mapper node means LVM, so the obvious next step is to ask LVM about it directly:

```
sudo pvs
sudo vgs
sudo lvs
```

All three came back completely empty. As far as LVM's own tools are concerned, there is no physical volume, no volume group, and no logical volume anywhere on this system. Which is a strange thing to be told while looking at a device that very much exists.

## But /dev/mapper Disagrees

```
ls -la /dev/mapper
```

```
600  control
777  vg0-d1 -> ../dm-0
777  vg0-firewall -> ../dm-1
777  vg0-firewall--clone -> ../dm-2
777  vg0-images -> ../dm-3
```

Four entries, all under a volume group called `vg0`, and `vg0-images` maps to `dm-3` - the exact device `gio` was pointing at. `dmsetup` confirms these are real, active kernel objects, not leftover symlinks:

```
sudo dmsetup ls --tree
```

```
vg0-d1 (253:0)
 └─ (8:20)
vg0-firewall (253:1)
 └─ (8:20)
vg0-firewall--clone (253:2)
 └─ (8:20)
vg0-images (253:3)
 └─ (8:20)
```

All four depend on the exact same underlying device: major 8, minor 20.

## Whose Backing Device Is 8:20?

Major number 8 is SCSI/SATA disks. But:

```
lsblk
```

didn't show anything at `8:20` - no `sdb`, no partition providing that major/minor pair at all. That's the confirmation: `vg0` lived on a disk that isn't attached to this machine any more. Exactly what I'd done - unmounted the volume, then pulled the disk - just with one step missing.

## Why LVM's Own Tools Don't Complain

`pvs`/`vgs`/`lvs` work by scanning currently-present devices for LVM metadata signatures. If the physical volume isn't there, LVM has nothing to find and nothing to report - it won't warn you that stale device-mapper state has been left behind, because from its point of view, there's no volume group to have an opinion about.

Device-mapper is a separate, lower layer. The mapping tables it builds live in the kernel and persist until something explicitly tears them down - either `dmsetup remove`, or `vgchange -an <vg>` run *before* the disk disappears, which cleanly deactivates every logical volume in the group first. Pull the disk without doing that, and the kernel just keeps the mappings around, now pointing at nothing.

## Confirming It's Safe to Clean Up

Before removing anything, I checked each of the four:

```
sudo dmsetup info vg0-images
```

```
State:             ACTIVE
Open count:        0
Major, minor:      253, 3
```

`ACTIVE` with `Open count: 0` on all four - nothing currently has any of them open, so nothing would be disrupted by tearing them down. Not that there was much to disrupt anyway: every one of them is already dangling, since the disk behind it is gone.

## The Fix

```
sudo dmsetup remove vg0-images
sudo dmsetup remove vg0-firewall--clone
sudo dmsetup remove vg0-firewall
sudo dmsetup remove vg0-d1
```

This only deletes the kernel's device-mapper mapping. It can't touch any actual data - there was none reachable through it any more regardless. Nautilus's sidebar entry disappeared straight away; if it doesn't for you, `killall nautilus` (it'll restart itself) forces GVfs to re-enumerate.

## The Lesson

Deactivate a volume group with `vgchange -an <vg>` before physically removing its disk, not after - that's the step I'd skipped. And if you ever see a volume that "shouldn't exist any more," don't stop at `pvs`/`vgs`/`lvs` coming back empty and conclude there's nothing to find. Check `ls /dev/mapper` and `dmsetup ls --tree` too - device-mapper keeps its own state, independently of whatever LVM's metadata scan can currently see.

## References

[dmsetup(8)](https://man7.org/linux/man-pages/man8/dmsetup.8.html)

[vgchange(8)](https://man7.org/linux/man-pages/man8/vgchange.8.html)
