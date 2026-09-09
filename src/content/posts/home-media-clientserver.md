---
pubDatetime: 2016-09-21T14:58:07Z
modDatetime: 2016-09-22T18:58:23Z
title: "Home Media Client/Server"
tags:
  - "couchpotato"
  - "kodi"
  - "Linux"
  - "nzbget"
  - "openelec"
  - "Privateer"
  - "raspberry pi"
  - "sonarr"
  - "synology"
description: "A couple of years ago I decided to get the TV connected to something other than satellite and cable. It seems that in this environment XMBC was the daddy of all things media and a few generations on it's now called Kodi and is truly an awesome media player."
---
## Playing Media

![kodi](/blog-media/2016/09/kodi.png) Kodi A couple of years ago I decided to get the TV connected to something other than satellite and cable. It seems that in this environment XMBC was the daddy of all things media and a few generations on it's now called [Kodi](https://kodi.tv/) and is truly an awesome media player. The way to use Kodi to stream media to the TV over HDMI was either to buy a pre-built Kodi device or build my own using a [Raspberry Pi](https://www.raspberrypi.org/). Don't let the build your own side of things put you off - it really is more simple than you can imagine. All for under £50 you can build a very capable HD 1080p media player.

- Raspberry Pi
- Case for the Raspberry Pi
- 8GB Micro SD card
- 2A Micro USB Power Supply (same as your phone uses)
- HDMI cable

![openelec](/blog-media/2016/09/openelec.png) OpenELEC You can even buy the SD card preloaded with Kodi so no need to copy it on yourself. That said I chose to download and install [OpenELEC](http://openelec.tv/) (Open Embedded Linux Entertainment Center) which is a pre-made Linux Operating System containing Kodi and ready to go. Now you can use wireless from the newer Raspberry Pi 3 Model B, which has it built in, or by using a USB adapter with a Model 2 B, I really wouldn't recommend it. Wi-fi just doesn't have the bandwidth for full HD in my opinion (unless you run 802.11ac). So get the Pi hooked onto your Ethernet network.

## Storage

Whilst playing media is a good thing sourcing it is another. You can stream it over the internet, but with three TV's in the house all streaming at once, and usually the same thing, although not necessarily at the same time, the best solution seemed to stream it from a local network storage device. This is where the [Synology](https://www.synology.com/en-uk/) NAS came it. Add a couple of large disks into the NAS and I then have plenty of space for downloading and storing media. But the Synology doesn't stop there. It's way more than a storage device. It's a fully capable Linux server with support for 3rd party applications - all managed using a web user interface, no specialist Linux knowledge required. What I needed was to setup a sharing protocol that all my Raspberry Pi's could connect to and consume media from. The obvious choice to this Linux based environment is NFS. The Synology is capable of setting up NFS for shared folders and the Raspberry Pi is equally cable of connecting to them. Now I can store my media in one shared folder and all the Raspberries can connect and stream from an internal system, leaving he internet bandwidth alone beyond the initial single download.

## Sourcing

Now this part is a very contentious area in terms of copyright. If you're going to download and store media it is probably going to fall in violation of copyright legislation. That said I still pay a huge subscription to a satellite/cable TV provider with all channels including movies. So I'd argue I'm more than contributing to the rights owners.

### Downloading

You can obtain this questionable material using various methods, torrents, streams or in my preferred manner Usenet. The Synology is very good at this. It has 3rd party apps you can install at the click of a button to handle downloading from Usenet or torrents. My particular favourite is [NZBGet](http://nzbget.net/). I simply give it my credentials to the Usenet service I pay a subscription to and it sits waiting to download whatever I instruct it to. Now I just need something to give it instructions.

### Searching / Indexers

In order to find things either on Usenet or torrents you need to have a reliable search engine. Think of it like the Google of download sites. You ask it a question, it goes and searches to see if it exists. Typically the better search engines / indexers require a paid subscription. The free ones generally don't do any filtering for spam results.

### TV Series

![sonarr](/blog-media/2016/09/sonarr.png) Sonarr Another 3rd party app on the Synology is the excellent [Sonarr](https://sonarr.tv/). This is the searcher of TV series. It looks at internet database(s) for TV shows and when they are aired. So all you need do is enter a name of a series, it will look for it and add it to your scheduled downloads. It searches using your indexer and if it finds something it will instruct your downloader (NZBGet) to go get it. Sonnar keeps track of upcoming and already aired programs, so it will try to get anything from previous series and even wait for the new series to air before trying to search for it. It will also only download files that meet your quality requirements. If all you want are HD programs you can specify this and it will wait until the best quality is available.

### Movies

![couchpotato](/blog-media/2016/09/couchpotato.png) Couchpotato Completing the holy trinity is [Couchpotato](https://couchpota.to/). another ready and waiting 3rd party app on the Synology. This monitors internet databases for movie information. Again it searches using your indexer and will wait until a movie is released before it tries searching. Again Couchpotato can use quality filters so no downloading those rubbish cinema camcorder movies. All this might seem a bit complicated, but in reality it's all managed through web interfaces and a graphical interface on your TV. You setup the NFS folder shares on the Synology, tell Kodi on the Pi's where to connect to. Then tell NZBGet where to download from and to (the to is the same place as your shared folder). It's then a case of telling Sonarr and Couchpotato about your indexer and to talk to NZBGet. Once it's all taking to each other it's very much like using a satellite/cable planner. Just select what you want to watch or play. Next on my list it to try out [OSMC](https://osmc.tv/). Like OpenELEC it includes Kodi, but is a more up to date version.
