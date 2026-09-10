---
pubDatetime: 2024-01-05T19:10:01Z
modDatetime: 2024-01-07T13:30:33Z
title: "Zombie Laptop"
tags:
  - "Linux"
  - "Privateer"
  - "wifi"
heroImage: "/blog-media/2024/01/image-1.png"
description: "Some years ago my brother bought an Asus K53E laptop, 4GB RAM, Intel Core i7-2670QM. It came with Windows 7 Home Premium. It was a slow and tedious thing,"
---
Some years ago my brother bought an Asus K53E laptop, 4GB RAM, Intel Core i7-2670QM. It came with Windows 7 Home Premium. It was a slow and tedious thing, and within a year he became fed up with it, and replaced it with an iPad.

A year or so later, I needed a laptop, just to plug a works HDD in a pull off some data before returning the works' laptop. He dug it out from the attic, but had no power supply. I said I'd buy one just for this task, and he could keep it when I returned it.

## Thanks for the Memory

On returning it, he simply gave it to me, as he had no use for it. I'm not a big laptop fan, and it may only get light usage from me anyhow. But, I'd spent £16 on a power supply, and now owned a laptop. A bit more RAM, and I'm sure I'll get some use from it. £20 to upgrade it to the maximum 8GB, and then installed Linux. It was a happy little beastie now.

## All Your Bytes are Belong to Us

Cue another few months, and a Samsung 1TB 870EVO Solid State Disk (SSD) fell from the sky, and what better place than the laptop. Now it's a very proficient little beast. Starts up in zero time flat.

Let's get some more life out of the battery? I don't need the DVD drive - who uses those any more? I came across a very handy replacement that allowed me to install another SATA SSD in the bay where the DVD was. I don't need more storage, but it's useful to pop a disk in, and download data onto it rather than an external USB drive. Then pop the drive out and put in something else.

But in reality it sits empty most of the time. But at least no spinning disk is eating the battery life.

## You Shall Not Pass

That was until the sad day when I could not log in to the laptop. I could not get past the LUKS encryption for some reason. OK, I think it's had its day and will be put out to pasture. As luck would have it, one time I tried, I pressed the "Enter" key on the keyboard, instead of the "Return" key, and it logged me in. I just have a keyboard problem. No biggie, as long as I remember to use "Enter", or I can use a USB keyboard (I don't really like laptop keyboards anyhow), but that defeats the object of a laptop.

A quick trawl of the net and I find I can buy a replacement keyboard for less than £10 delivered! A check of how hard it is to fit shows that you don't even need a screwdriver. It clips in. The next day, pop the old one out. Clip the cable in press the new keyboard down, and you honestly would not know it was not an original item.

![](/blog-media/2024/01/image-1.png)

## Spirit of the Radio

The Gigabit Ethernet is where it spent its life, as the Wi-Fi throughput isn't stunning. Some built in Realtek Wi-Fi 4 adapter that pretty much sucked. Did the job if a cable wasn't available. I came across an entry online explaining how to replace a faulty Wi-Fi adapter, and a light bulb moment occurred. If it can be easily replaced, can it be updated? Not sure what type it is, it can't be m.2, that would be too new. So what is it? I can't find the detail. But I found an adapter on Amazon that seemed to have the same connection edge. It said it was PCIe v4.0, but the laptop can't be, can it?

Well, for £17 I thought it's too good to not just try it. Now I know a bit about Wi-Fi adapters and Linux. Realtek chipsets seem to be the in thing. The downside, and the thing I don't understand, is why they are used so widely, given that the manufacturer driver support just sucks. I also have some experience with Asus Wi-Fi PCIe card for my desktop. They performed superbly at 802.11ac, but more recently I ran into issues with driver support in the kernel for the Broadcom chipset they are based on. I ended up swapping out my trusty AC58 for an Intel AX210 based card.

![](/blog-media/2024/01/image.png)

> The card I found on Amazon was based on the Intel AX210, so I knew the driver support should be good. It's been stable in my desktop for many kernel updates. I took the plunge, spent the £17 and got the card next day.
>
> [https://www.amazon.co.uk/dp/B09LGZ1T9K](https://www.amazon.co.uk/dp/B09LGZ1T9K?psc=1&ref=ppx_yo2ov_dt_b_product_details)

I eagerly removed the two screws on the laptop's bottom panel, which exposed the Wi-Fi adapter with antenna connections. It only had one screw, so I removed it, unplugged the antennas and swapped it for the new AX210. Powered on the laptop and it did not miss a beat. Came straight on and connected to the home SSID without any reconfiguration.

Once logged in, I find I can free up a USB port, too. The AX210 comes with Bluetooth, so no need for the little thing sticking out the side any more.

```
Network:
  Device-1: Intel Wi-Fi 6 AX210/AX211/AX411 160MHz driver: iwlwifi v: kernel
    bus-ID: 02:00.0
Bluetooth:
  Device-1: Intel AX210 Bluetooth driver: btusb v: 0.8 type: USB
    bus-ID: 1-1.1:3
```

![](/blog-media/2024/01/image-2.png)

## Epilogue

Well, I suppose it's not the fasted laptop in the world, and the screen resolution at 1366x768 leaves a lot to be desired. The 768 height can be a killer on some web apps. That said with Gnome tweaks and a zoom of 75%, I get a virtual resolution of 1822x1024, which is surprisingly readable. But it does have VGA and HDMI ports for an external monitor. It's also pretty weighty and isn't going to cradle into your arms easily for some one-handed typing, whilst stood at a server rack.

It does have a lot of positives, though. If you ever tried to replace the battery, any RAM, storage, Wi-Fi or keyboard on some of the newer tiny laptops you need a spudger kit, and a tub to store the mass of different length screws you need to remove to get to things. This has two screws for the base cover to access the SSD, Wi-Fi and RAM, 2 screws for the SSD and the battery and keyboard just clip on.

For all that it's cost me (\< £70) it's been a real trouper. If ever given the need to look for another laptop, or recommend to others, I'd say look for these kinds of features if you're planning on keeping it a while. Oh, and run a sensible Operating System like Linux, of course.

![](https://www.speedtest.net/result/15720857327.png)
