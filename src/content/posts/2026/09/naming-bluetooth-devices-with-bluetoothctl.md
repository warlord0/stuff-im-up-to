---
pubDatetime: 2026-09-28T12:00:00Z
title: "Naming Bluetooth Devices with bluetoothctl"
tags:
  - "bluetooth"
  - "manjaro"
  - "Fish"
heroImage: "/blog-media/2026/09/bluetooth-header.webp"
heroThumb: "/blog-media/2026/09/bluetooth-thumb.webp"
description: "I have the same keyboard at home and at work, and telling them apart in the Bluetooth menu was impossible - worse still with three remembered connections for what should only be two devices. BlueZ supports a per-device alias, and bluetoothctl makes it easy to set from the terminal."
---

I have the same keyboard, a Logitech ERGO K860, both at home and at work. Both show up in the Bluetooth menu under the exact same name, which makes it impossible to tell which one is actually connected at a glance - not helped by having three remembered connections listed for what should only ever be two devices.

BlueZ, the Linux Bluetooth stack, supports a local alias for any device, and it's straightforward to set from the terminal with `bluetoothctl`.

## Installing bluetoothctl on Manjaro

On Manjaro (and Arch generally), `bluetoothctl` ships separately from the rest of BlueZ, in `bluez-utils`, which isn't always pulled in by default:

```
sudo pacman -S bluez-utils
```

If `bluetoothctl` then reports "No default controller available," or just seems to hang, the Bluetooth service itself probably isn't running:

```
systemctl status bluetooth
```

If it's inactive, enable and start it:

```
sudo systemctl enable --now bluetooth
```

## Working Out Which Device Is Which

List everything that's paired, and separately whatever's actually connected right now:

```
bluetoothctl devices
bluetoothctl devices Connected
```

Each keyboard has its own MAC address, which at this point is the only thing that actually tells them apart - the name is identical on both. With one keyboard switched on, run the `Connected` variant and note its MAC address, then repeat with the other.

## Setting an Alias

The simplest way is to connect to the device and set the alias from inside `bluetoothctl` itself:

```
bluetoothctl
connect AA:BB:CC:DD:EE:FF
set-alias "K860 Home"
quit
```

`set-alias` applies to whatever device you're currently connected to. It needs double quotes around the alias if it contains a space, same as the D-Bus version below - without them, `bluetoothctl` treats each word as a separate argument rather than one alias.

If you'd rather not connect first, the alias can be set directly over D-Bus instead - swap the colons in the MAC address for underscores:

```
busctl set-property org.bluez /org/bluez/hci0/dev_AA_BB_CC_DD_EE_FF \
  org.bluez.Device1 Alias s "K860 Work"
```

That `busctl` command works as-is in fish, backslash line continuation included.

Either way, the alias is written to `/var/lib/bluetooth/<adapter-MAC>/<device-MAC>/info` as `Alias=`, so it survives a reboot. The desktop's Bluetooth menu should pick up the new name, though toggling Bluetooth off and on sometimes helps it notice. KDE's own Bluetooth settings let you rename a device through the GUI directly; GNOME's doesn't offer renaming, but will display whatever alias has already been set this way.

## Why There Were Three

The K860 has three Easy-Switch channels, and Logitech devices generally present a different MAC address per channel. Re-pairing on a different channel at some point, or just re-pairing in general, leaves stale extra entries behind. Once the two real ones are identified, the leftover can be removed:

```
bluetoothctl remove 11:22:33:44:55:66
```

## One Thing to Remember

Aliases are local to whichever machine you set them on. Use the same two devices with more than one computer, and each machine needs its own aliases set separately.

## References

[BlueZ](http://www.bluez.org/)

[bluetoothctl(1)](https://manpages.debian.org/testing/bluez/bluetoothctl.1.en.html)
