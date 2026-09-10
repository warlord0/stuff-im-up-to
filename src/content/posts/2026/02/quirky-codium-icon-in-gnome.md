---
pubDatetime: 2026-02-18T10:29:52+00:00
title: "Quirky Codium Icon in Gnome"
tags:
  - "Linux"
  - "Gnome"
heroImage: "/blog-media/2025/06/vscodium_logo.png"
description: "After an update Codium started launching strange in my Gnome instance. It would launch and show an app in the panel with no icon. If I clicked the Codium icon it would launch a new app, stacking on the \"no icon\" version. I resorted to grabbing the desktop file from a working system and dropping…"
---
After an update Codium started launching strange in my Gnome instance. It would launch and show an app in the panel with no icon. If I clicked the Codium icon it would launch a new app, stacking on the “no icon” version. I resorted to grabbing the desktop file from a working system and dropping it into `/usr/share/applications`.

## 1. Create the `.desktop` file

Create a file in `/usr/share/applications/` (system-wide) or `~/.local/share/applications/` (current user only):

    sudo vi /usr/share/applications/vscodium.desktop

Paste your entry:

    [Desktop Entry]
    Name=VSCodium
    Comment=Code Editing. Redefined.
    GenericName=Text Editor
    Exec=/usr/bin/codium %F
    Icon=vscodium
    Type=Application
    StartupNotify=false
    StartupWMClass=VSCodium
    Categories=Utility;Development;IDE;
    MimeType=text/plain;inode/directory;
    Actions=new-empty-window;
    Keywords=vscode;

    [Desktop Action new-empty-window]
    Name=New Empty Window
    Exec=/usr/bin/codium --new-window %F
    Icon=vscodium

## 2. Update the desktop database

    sudo update-desktop-database /usr/share/applications

## 3. Launch the app via `gtk-launch`

This is the key step on Wayland — it forces GNOME to properly register the `.desktop` entry and associate the running window with it. Without this, the app may launch as an unrecognized window on the panel with no association to its entry.

    gtk-launch vscodium

> The argument to `gtk-launch` is the filename of your `.desktop` file without the `.desktop` extension.

## 4. Pin to dock

Once the app is running and properly associated, right-click its icon on the panel and select **“Add to Favorites”** (or “Pin to Dash”). It will now persist on the dock.
