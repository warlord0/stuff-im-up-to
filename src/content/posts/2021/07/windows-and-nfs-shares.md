---
pubDatetime: 2021-07-12T07:12:34Z
title: "Windows and NFS Shares"
tags:
  - "Linux"
  - "nfs"
  - "Windows"
heroImage: "/blog-media/2017/12/2000px-windows_10_logo-svg.png"
description: "Considering I've been a long term user of Windows - far longer than Linux, I really find myself detesting the platform with a vengeance. All I wanted to do"
---
Considering I've been a long term user of Windows - far longer than Linux, I really find myself detesting the platform with a vengeance. All I wanted to do was mount an NFS share from a Linux system or NAS. All the guides I find pretty much say Install the NFS Client for Windows and then use mount. Not very helpful guys.

Let's go into the "Add or Remove Programs" in settings and looks for "Optional features" and find absolutely nothing about NFS, click "Add a feature", still nothing.

Well it's possible to do this by using the old fashioned "Control Panel" under "Programs" and "Turn Windows features on or off" and scroll the tree to find "Services for NFS".

Windows 10 is how old now? We still must use legacy features to go looking for how to install something!?
