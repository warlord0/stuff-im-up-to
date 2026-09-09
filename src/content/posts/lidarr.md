---
pubDatetime: 2018-05-23T07:33:49Z
modDatetime: 2018-05-23T07:41:12Z
title: "Lidarr"
tags:
  - "Docker"
  - "Linux"
  - "Privateer"
description: "Since trying out Headphones a few years ago I got frustrated with it in the first hour and ditched it and went back to manually downloading music. That was"
---
Since trying out Headphones a few years ago I got frustrated with it in the first hour and ditched it and went back to manually downloading music. That was until I got pointed to Lidarr. Lidarr is either a fork of, or certainly based on the excellent Sonarr project for downloading TV series.  Lidarr applies the same methodology and familiar interface to download music. It's still early days so there's no build for my Synology NAS yet. But it does have a Docker image. I downloaded and installed it. During which time it was a bit of a learning curve as I've never used Docker, so there were a few quirks along the way.

## Install Docker CE

First install Docker CE (Community Edition) on Debian. This is done more easily by adding the Docker repository rather than use the older version that probably exists in your Debian install. [https://docs.docker.com/install/linux/docker-ce/debian/](https://docs.docker.com/install/linux/docker-ce/debian/) The only thing I did different to this was add a list file under `sources.list.d/docker.list` and put the Docker repository entries in there instead of straight in the `sources.list` file.

## Install the Lidarr Docker Image

Follow the guide here: [https://hub.docker.com/r/linuxserver/lidarr/](https://hub.docker.com/r/linuxserver/lidarr/) I tripped over the `docker create` paths and foolishly assumed that the colons (:) were Windows path related. They aren't! The colons signify a separator between folder and mount point within the Docker container. So the documented:

    docker create \
       --name=lidarr \
       -v <path to data>:/config \
       -v <path to downloads>:/downloads \
       -v <path to music>:/music \
       -e PGID=<gid> -e PUID=<uid> \
       -p 8686:8686 \
       linuxserver/lidarr

In my setup becomes:

    docker create \
       --name=lidarr \
       -v /home/lidarr/config:/config \
       -v /home/lidarr/volume1/Downloads:/downloads \
       -v /home/lidarr/volume2/Music:/music \
       -v /home/lidarr/volume1/Downloads:/volume1/Downloads \
       -e PGID=1002 -e PUID=1002 \
       -p 8686:8686 \
       linuxserver/lidarr

The `-v` options mount my local file systems `/home/lidarr/config` folder into the Docker container path `/config`. The other paths I've used are actually mounted from my Synology NAS using NFS and because my NZBGet runs on the NAS and has download paths of `/volume1/Downloads` I mirrored the directory structure so when NZBGet gives a notification that a download is complete the path within the Docker container matches the path that NZBGet actually uses on the NAS. I did this by specifying the mount point the `/home/lidarr/volume1/Downloads` to mount into `/volume1/Downloads`. Just to separate my data and permissions I created a local user called `lidarr`. This user got the uid and gid of `1002`. That is used in the create command to give Docker the necessary permissions to the lidarr home folder. Now I can start and stop my Docker container and visit the URL of my Linux host in a browser using [http://\[hostname\]:8686](#)

    $ sudo docker start lidarr
    $ sudo docker stop lidarr

## Mounting the NFS Shares from the NAS

For testing I've just mounted them manually:

    $ sudo mount 192.168.1.3:/volume1/Downloads /home/lidarr/volume1/Downloads
    $ sudo mount 192.168.1.3:/volume2/Music /home/lidarr/music

Next step will be to move these into `/etc/fstab` so they mount at boot. On the NAS I've set the option to squash all users to admin, which isn't a concern for me as the share is only accessible from the IP of my Linux box anyhow.
