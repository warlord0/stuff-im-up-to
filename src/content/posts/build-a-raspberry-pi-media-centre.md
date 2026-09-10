---
pubDatetime: 2016-09-22T01:00:00Z
modDatetime: 2016-09-22T18:58:02Z
title: "Build a Raspberry Pi Media Centre"
tags:
  - "kodi"
  - "Linux"
  - "openelec"
  - "osmc"
  - "Privateer"
  - "raspberry pi"
heroImage: "/blog-media/2016/09/raspberry_pi_wallpaper_hd_1080p_by_tpbarratt-d4suve2.jpg"
description: "Following on from the previous post about setting up a Home Media Client/Server setup I thought I'd put together a \"how to\" for building your own Raspberry Pi Media Centre with Kodi and a list of ingredients."
---
Following on from the previous post about setting up a Home Media Client/Server setup I thought I'd put together a "how to" for building your own Raspberry Pi Media Centre with Kodi and a list of ingredients.

## Buy a Raspberry Pi SBC

Which one? The fastest and best at the time is the Raspberry Pi 3 Model B. The Pi 2 Model B will do, but why not take on the latest and greatest? \* SBC = Small Board Computer.

### The Board

They're available from many sources. I got one of mine from [RS Components](http://uk.rs-online.com/web/p/processor-microcontroller-development-kits/8968660/), but also bought from Amazon and the [The PiHut](https://thepihut.com/collections/raspberry-pi) too. You'll pay around £30 for one as a bare board, no case or power supply etc. You could go buy the starter kit if you'd rather not wait to figure out stuff like power supplies, cases and SD cards.

### The Power Supply

You'll need to buy a power supply for it. Although it is the same USB style connector as your phone charger, many phone charger supplies can't supply the amps needed to drive the Pi 3 reliably. So safer to buy one. Make sure the power supply is rated at at least 2A.

### The Case

Pi cases are cheap and available from loads of places. Some are a bit boxy and boring looking. I've had a few clear ones and layered ones, but eventually I decided I wanted it to look like part  of my TV setup and not like [Orac from Blakes 7](http://www.blakes-7.co.uk/pictures/gadgets/orac2large.jpg). So I settled on one like this. It came in at a whopping £2.99 including delivery! ![picase](/blog-media/2016/09/picase.png) Raspberry Pi Model 2/3 B Case

### Micro SD Card

8GB is plenty big enough. That said they're cheap as ... well, chips these days. I recently bought 2 x 16GB Samsung EVO's for just over a tenner with free postage, when a single 8GB came in at a tenner because of postage costs. You'll want to buy a decent brand name from a reliable source. Some of the auction sites have a lot of fakes, so be wary. Make sure you go for one that's fast. Look for a Class 10. I tend to buy SanDisk Extreme's or Samsung EVO's.

## Putting it Together

It's a simple case of snap the circuit into the plastic and screw it closed. Slip in the SD card if you have bought a pre-made one, plug it into your TV or surround system using the HDMI cable and then plug in the USB power connector. It'll boot and away you go... almost. Remember this is a tiny computer, you'll need to interface with it some how. This is where the USB ports come in handy. Plug a keyboard in and you'll be able to type to answer the setup questions and get your choice of system installed. I hear you cry "Wait I won't need that keyboard plugged in all the time though will I?" After all the tiny appearance of the Pi would be shadowed by a huge keyboard plugged in all day. Well there are a few answers to that. Buy a smaller USB wireless keyboard, buy a Flirc or use your smart phone or tablet to control it over the network. [More on this later](#controlling-the-pi).

## Your Choice of Operating System

If you've bought a pre-made NOOBS SD card you just follow the instructions with that to setup whatever it presents you with. I must confess never to having used it. My preferred way is grab an image of the Operating System I'd like to try and write it onto the SD card from my PC. Then plug it in and go. To write to the micro SD card you want a [USB micro SD card reader](https://www.amazon.co.uk/s/ref=nb_sb_noss_2?url=search-alias%3Daps&field-keywords=micro+sd+usb). Some micros SD card come with these cheaply enough. You can end up paying more for postage than the reader! So check if you can pick up one with an SD card as some of those come in cheaper because they have free postage. I've played with Raspbian, Arch, OpenELEC,and OSMC. As this is about a media centre setup I'll simply refer to OpenELEC and OSMC as these two are complete ready to go Operating Systems with Kodi just waiting to go. Using Linux the process for me is the same for both OpenELEC and OSMC it's a simple case of downloading the image file from their websites to your PC. These are usually in the form of a .img.gz file. Then I just mount the micro SD card in a USB reader and dd the image onto it. [![osmcfavicondark300-300x300](/blog-media/2016/09/osmcfavicondark300-300x300.png)](https://osmc.tv/download/) [OSMC Download](https://osmc.tv/download/) [![openelec](/blog-media/2016/09/openelec.png)](http://openelec.tv/get-openelec) [OpenELEC Download](http://openelec.tv/get-openelec) Extract it and write it to the USB reader.

    $ gunzip OSMC_TGT_rbp1_20160910.img.gz
    $ sudo dd bs=4M if=OSMC_TGT_rbp1_20160910.img od=/dev/sd[c]

But these days they have some nice Windows ready programs that will do that process for you if you're in the world of Microsoft.

### Controlling the Pi

Whatever you choose to install initially it's way easier to just use a keyboard to type into the system to get it setup. Once it's running though you don't really want to have that keyboard laying next to it. One way to go is [tiny wireless keyboard](https://www.google.co.uk/search?q=raspberry+pi+keyboard&source=lnms&tbm=isch&sa=X&ved=0ahUKEwiblqyUvqLPAhUK1xoKHYuvALkQ_AUICSgC&biw=1440&bih=772). This gives you complete flexibility of using the Pi from your arm chair and having a full QWERTY to do it. However, once running you don't really need a full QWERTY keyboard. ![flirc-800x800](/blog-media/2016/09/flirc-800x800.png)My preferred option is to use my existing Logitech Harmony remote control. I programmed my TV, cable and surround system into it. So using it with the Pi would be great. But to get it to talk with the Pi I needed to use a USB infrared receiver. I opted for the [Flirc](https://flirc.tv/more/flirc-usb) which out of the box is easy to setup and there's even a ready made template for the Logitech Harmony. So no fiddling about setting it up. In the Logitech config, just select Flirc and plug it into the Pi. Even then you don't even really need to use the Kodi menu system at all. So no need for a keyboard or even a remote - if you have a smart phone or tablet. There are some completely free Kodi/XBMC control apps in the app stores for both Android and the fruit stuff. Kodi even have an "official" controller called [Kore](https://play.google.com/store/apps/details?id=org.xbmc.kore). But there's also [Yatse](https://play.google.com/store/apps/details?id=org.leetzone.android.yatsewidgetfree&hl=en) which has a lot of features. These aren't just button type remotes. They're fully featured graphic interfaces so you needn't look at the TV at all whilst controlling it.
