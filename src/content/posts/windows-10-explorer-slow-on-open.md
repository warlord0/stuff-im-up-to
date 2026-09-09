---
pubDatetime: 2017-12-19T20:47:58Z
modDatetime: 2017-12-19T20:50:19Z
title: "Windows 10 Explorer Slow on Open"
tags:
  - "samba"
  - "Windows"
description: "This wound me up this week. Every time I tried to open an Explorer instance to view some files I'd have to wait what seemed like an eternity before the win"
---
This wound me up this week. Every time I tried to open an Explorer instance to view some files I'd have to wait what seemed like an eternity before the window opened. It must have been about 30 seconds, maybe longer. Ultimately it turned out to be a problem of my own making - kind of. I'd repeatedly visited a Samba/CIFS share on a virtual Linux box I've been working on. Windows decided to add the share to my "Quick Access" list. But because the virtual box isn't always on, the share wasn't accessible and so explorer would have to wait for it to time out before showing me my C: drive. Just clear the "not so" Quick Access list and presto, Explorer is back to opening quickly again. Press Windows Key (or open Start Menu), type "folder" and open the "File Explorer Options" that are listed. Then click the "Clear" button under Privacy to get things back to as they should be. ![capture2](/blog-media/2017/12/capture2.png) I Googled plenty that recommended MSCONFIG and stopping services like Windows Search and Cortana, adding Registry Keys and other nonsense. When all it was is a Quick Access entry.
