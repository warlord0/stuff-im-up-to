---
pubDatetime: 2021-04-03T16:47:45Z
title: "Terminal Not Starting"
tags:
  - "Linux"
  - "manjaro"
description: "I just installed Manjaro on my laptop and found a quirk problem where the terminal won't fire up. I resorted to installing xfce-terminal to see what was do"
---
I just installed Manjaro on my laptop and found a quirk problem where the terminal won't fire up. I resorted to installing `xfce-terminal` to see what was doing on. Looking at `journalctl` I find this:

```
Apr 01 19:16:11 manjaro systemd[1193]: Starting GNOME Terminal
Server...
Apr 01 19:16:11 manjaro gnome-control-c[16569]: Locale not supported by
C library.
                                                        Using the
fallback 'C' locale.
Apr 01 19:16:11 manjaro dbus-daemon[1212]: [session uid=1000 pid=1212]
Successfully activated service 'org.gnome.ControlCenter.SearchProvider'
Apr 01 19:16:11 manjaro gnome-calculato[16573]: Locale not supported by
C library.
                                                        Using the
fallback 'C' locale.
Apr 01 19:16:11 manjaro gnome-terminal-server[16576]: Locale not
supported.
Apr 01 19:16:11 manjaro systemd[1193]: gnome-terminal-server.service:
Main process exited, code=exited, status=9/n/a
Apr 01 19:16:11 manjaro systemd[1193]: gnome-terminal-server.service:
Failed with result 'exit-code'.
Apr 01 19:16:11 manjaro systemd[1193]: Failed to start GNOME Terminal
Server.
```

I took a look at my `/etc/locale.conf` and it looked fine:

```
LANG=en_GB.UTF-8
LC_COLLATE=C
```

Checked `localectl`:

```
$ localectl
   System Locale: LANG=en_GB.UTF-8
                  LC_COLLATE=C
       VC Keymap: uk
      X11 Layout: gb
```

Then looked through `/etc/locale.gen` and found `de_DE.UTF8 UTF-8` uncommented, which appears normal for Manjaro. But `en_GB.UTF-8 UTF-8` was commented out. I commented out the German and uncommented the GB version and ran `locale-gen`. Then I was able to launch the `gnome-terminal` and uninstall the `xfce4-terminal`.
