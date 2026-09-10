---
pubDatetime: 2021-05-14T07:44:45Z
modDatetime: 2021-05-14T08:01:38Z
title: "YouTube Music PWA"
tags:
  - "Linux"
  - "Windows"
heroImage: "/blog-media/2021/05/youtube.png"
description: "YouTube music now has a PWA (progressive web app). In Chrome you may get asked to install this when you visit https://music.youtube.com . As I'm a Vivaldi"
---
YouTube music now has a PWA (progressive web app). In Chrome you may get asked to install this when you visit [https://music.youtube.com](https://music.youtube.com).

As I'm a Vivaldi user the PWA isn't immediately available on my home system for some reason. After a bit of trawling I find I need to tun on the experimental feature using this special address in the address bar **vivaldi:experiments** then tick the enable the install of progressive web apps.

Now I can visit the You Tube music URL and right click on the tab it's in then select Install. Now you should have an icon available in your desktop launcher to take you straight to your music.

## Further Enhancement

I edited my `.desktop` file once it was created an modified it to remove the address bar:

```
$ vi .local/share/applications/vivaldi-cinhimbnkkaeohfgghhklpknlkffjgod-Default.desktop

#!/usr/bin/env xdg-open
[Desktop Entry]
Version=1.0
Terminal=false
Type=Application
Name=YouTube Music
#Exec=/opt/vivaldi/vivaldi --profile-directory=Default --app-id=cinhimbnkkaeohfgghhklpknlkffjgod
Exec=/opt/vivaldi/vivaldi --profile-directory=Default --app=https://music.youtube.com --kiosk
Icon=vivaldi-cinhimbnkkaeohfgghhklpknlkffjgod-Default
StartupWMClass=crx_cinhimbnkkaeohfgghhklpknlkffjgod
```

Original line commented out
