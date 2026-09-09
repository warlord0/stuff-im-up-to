---
pubDatetime: 2021-05-06T13:10:58Z
modDatetime: 2021-05-07T06:50:58Z
title: "Don't Go To Sleep"
tags:
  - "gnome"
  - "Linux"
  - "manjaro"
description: "I need my office PC to be permanently available so I can access it remotely. This was working just fine after I disabled all the sleep mode settings when I"
---
I need my office PC to be permanently available so I can access it remotely. This was working just fine after I disabled all the sleep mode settings when I was logged on at work. Then I remotely rebooted and after a period of inactivity the machine went to sleep. This was because no one was logged onto the system and it sat at the gdm greeter waiting for someone to login.

## How to prevent sleeping when no one is logged in

Mask the sleep related services

```
sudo systemctl mask sleep.target suspend.target hibernate.target hybrid-sleep.target
```

Set the gdm user not to sleep.

```
sudo -u gdm dbus-launch gsettings set org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type 'nothing'
```

Verify the gdm user setting

```
sudo -u gdm dbus-launch gsettings get org.gnome.settings-daemon.plugins.power sleep-inactive-ac-type
```
