---
pubDatetime: 2023-01-27T13:45:08Z
modDatetime: 2023-01-27T13:47:19Z
title: "Video Conferencing Screen Sharing"
tags:
  - "Linux"
  - "pipewire"
  - "Windows"
description: "The behaviour of my browser seemed to have changed, and no longer lets me share a screen. I end up with a presentation of three black screens to share, and"
---
The behaviour of my browser seemed to have changed, and no longer lets me share a screen. I end up with a presentation of three black screens to share, and no one gets to see the full screen. I also noticed some missing applications for sharing a window.

Searching the net, I found a Google Chrome option that enables sharing using pipewire. As I'm using Manjaro Gnome under Wayland this probably needs enabling.

[vivaldi://flags](#)

or more specifically:

[vivaldi://flags/#enable-webrtc-pipewire-capturer](#)

Once I enabled this, my share options changed, and I can now select the entire screen or the missing windows.
