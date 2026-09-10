---
pubDatetime: 2025-07-15T13:56:57+00:00
title: "Redis Insight"
heroImage: "/blog-media/2025/07/redis-insight.png"
description: "I always seem to forget about Redis Insight. Just lately I've been back at work developing applications that require integration and communication and for that purpose I choose Redis - well, more specifically Dragonfly and Valkey in AWS. But I keep finding myself wondering what data is going into my pub/sub channels, or what keys…"
---
I always seem to forget about [Redis Insight](https://redis.io/insight/).

Just lately I’ve been back at work developing applications that require integration and communication and for that purpose I choose Redis – well, more specifically [Dragonfly](https://www.dragonflydb.io) and [Valkey](https://valkey.io) in AWS. But I keep finding myself wondering what data is going into my pub/sub channels, or what keys are in the database.

Redis Insight is a graphical tool that you can use to view the data in your Redis compatible database.

Just download the AppImage drop it into `/opt/redis-insight` and create a desktop icon for it.

```
~/.local/share/applications/redis-insight.desktop
```

```
[Desktop Entry]
Name=Redis Insight
Comment=Redis GUI
Exec=/opt/redis-insight/Redis-Insight-linux-x86_64.AppImage
Icon=/opt/redis-insight/redis-insight.png
Type=Application
Categories=
StartupWMClass=Redis
```

Update the database:

```
update-desktop-database ~/.local/share/applications/ 
```
