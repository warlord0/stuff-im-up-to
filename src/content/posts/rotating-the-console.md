---
pubDatetime: 2026-08-31T16:04:46+00:00
title: "Rotating the Console"
tags:
  - "Linux"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "I have a 22\" monitor that it fixed next to my 32\" screen in portrait mode. When using a Linux command line based system it makes reading it a challenge. On a recent build of OpenWRT I was working with I needed to stop cricking my neck to read it properly. For the HDMI console…"
---
I have a 22″ monitor that it fixed next to my 32″ screen in portrait mode. When using a Linux command line based system it makes reading it a challenge. On a recent build of OpenWRT I was working with I needed to stop cricking my neck to read it properly.

For the **HDMI console itself**, we can rotate the text console 90° using `fbcon`.

The kernel supports:

    fbcon=rotate:1

where `1` means **90° clockwise**. ([origin.kernel.org](https://origin.kernel.org/doc/html/latest/fb/fbcon.html))

### Try it live first

On the OpenWrt console:

```
mount -t sysfs sysfs /sys 2>/dev/null
echo 1 > /sys/class/graphics/fbcon/rotate_all
```

If framebuffer console rotation is enabled in the kernel, the console should immediately rotate.

You can check whether the feature exists with:

```
ls -l /sys/class/graphics/fbcon/
```

If you see:

    rotate
    rotate_all

we’re in business.

### Make it permanent

If the live test works, add the kernel parameter:

    fbcon=rotate:1

to the OpenWrt kernel command line.

The live `echo 1` test is therefore the clean way to establish that your HDMI console supports rotation before we bake anything into the image.

The kernel documentation confirms that framebuffer console rotation is supported independently of the underlying display driver; `1` is clockwise 90°. ([origin.kernel.org](https://origin.kernel.org/doc/html/latest/fb/fbcon.html))
