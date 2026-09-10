---
pubDatetime: 2022-01-15T18:20:08Z
modDatetime: 2022-01-19T19:55:29Z
title: "Radarr and Synology"
tags:
  - "couchpotato"
  - "Linux"
  - "nzbget"
  - "Privateer"
  - "radarr"
  - "synology"
heroImage: "/blog-media/2022/01/radarr_logo-1.png"
description: "Well, Couchpotato is no longer being updated, and the project had been archived as read only. That's not good, I've used Couchpotato for years. I did some"
---
Well, Couchpotato is no longer being updated, and the project had been archived as read only. That's not good, I've used Couchpotato for years.

I did some googling around and it looks like Radarr has matured quite a bit. Radarr is a fork of the Sonarr project (the TV episode grabber), but Radarr is designed to fetch movies. A natural choice, when I'm already using Sonarr.

**I stopped the Couchpotato service on my DS214play and installed Radarr - and almost immediately regretted it!**

The memory requirements for Radarr just killed the little DS214play I have. It only has 1GB of RAM, but has performed solidly for many years. It's not in the budget to replace it with a new NAS. If the NAS part still works, let's looks at moving the grab and fetch to another device.

I need something that is cheap enough to buy, small and quiet enough to go unnoticed on the media shelf.

[Beelink GK35 Mini PC](https://www.bee-link.com/products/gk35-j3455) - this turned out faulty (no SSD connection). Then I went to replace it and the [GK55](https://www.bee-link.com/products/beelink-gk55) was cheaper. Now I have a faster processor, two 1GBbp NIC's and an Intel WiFi adapter.

The GK55 does have a design flaw though. I wanted to put in a 3.5" SSD for booting and use the m2 SATA for downloaded files. Whilst the case has a 3.5" mounting and cable, you can't fit it into the case and close it! The SSD physically interferes with the m.2 slot. I guess there may be a very narrow SSD on the market, but the 9mm SanDisk SDSSDX-120G-G25 won't fit. Change of plan, just use the 500GB m.2 [WDS500G2B0B](https://www.westerndigital.com/en-gb/products/internal-drives/wd-blue-sata-m-2-ssd#WDS500G2B0B) and partition it to keep the downloads from filling the OS.

After installing the minimal edition of Manjaro Gnome, it's time to install some tools.

Grab the yay package manager, so I can install Radarr from AUR. Then install Radarr, NZBGet and the tools required to extract downloads.

```
pamac install yay p7zip unzip unrar
yay radarr
yay nzbget-systemd> 
```

> It's easily possible to easily migrate both Radarr and NZBGet from one system to another. All you need to do is use the UI to back up and restore the config from old to new.

To get NZBGet working you will need to copy a default config into the nzbget users home and then it should start.

```
sudo -u nzbget cp /usr/share/nzbget/nzbget.conf /var/lib/nzbget/.nzbget
sudo systemctl enable nzbget radarr
sudo systemctl start nzbget radarr
```

These will fire up on the default ports and be accessible using:

[http://myhost:6789](#)

[http://myhost:7878](#)

The default username and password for nzbget is `nzbget` and `tegbzn6789`.

## Shared Volume

I created the same structure on the new host as the NAS:

```
sudo mkdir /volume1/Video
sudo ln -s /var/lib/nzbget/downloads/dst /volume1/Downloads 
```

This links the default NZB Get destination folder to my `/volume/Downloads` folder.

Because I want the files to live on my NAS after they have been downloaded, I need to mount the NAS volume on the new host. Initially, I used NFS for this - but try as I might, I could not get Radarr to import my movie folder.

```
sudo mount -t nfs mynas:/volume1/Video /volume1/Video
```

On the NAS I have the folder `/volume1/Video` exported and permissions allow me to mount it and write files to it, but Radarr seems to ignore it. Nothing in the log, even when I set it to debug logging.

I switched to using CIFS (Samba) and finally got things working. To install Samba and all the CIFS related dependencies, I installed the Gnome tools. In turn, they installed everything I needed.

```
pamac install nautilus-share manjaro-settings-samba
```

Now mount the folder using cifs.

Create a file `/etc/win-credentials` containing:

```
username=myuser
password=SuperSecretKey
```

Then make sure only root can read it.

```
sudo chown root: /etc/win-credentials
sudo chmod 600 /etc/win-credentials
```

Initially test the mount using it from the command line.

```
sudo mount -t cifs -o credentials=/etc/win-credentials,uid=965,gid=965,file_mode=0666,dir_mode=0777 //mynas/Video /volume1/Video
```

In Radarr I can now successfully import the existing Movie folder structure from `/volume1/Video/Movie` and because they are in the same location on both systems there's no need to reindex my Kodi.

When all is good, change the mount, so it's a permanent this from the `/etc/fstab` and will mount after a reboot.

```
//mynas/Video  /volume1/Video  cifs    credentials=/etc/win-credentials,uid=965,gid=965,file_mode=0666,dir_mode=0777,_netdev   0   0
```

Where the `uid` and `gid` are the new hosts user and group id for the `radarr` user.

## Radarr Settings

Make sure you enable metadata in Radarr so it creates the output files that Kodi can use to get the cover image and movie details. I went into Setting, Metadata and enable the Kodi (XMBC) / Emby option and enabled Movie images and Use Movie.nfo

> Having just upgraded to a 1GB internet download, the difference made by moving NZB Get from the Synology is huge! From 12MB/s download speed to 108MB/s!!! I guess the Synology just can't cope with the connections and throughput that are available to it.
