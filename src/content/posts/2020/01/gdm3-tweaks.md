---
pubDatetime: 2020-01-15T14:34:07Z
modDatetime: 2022-11-04T11:43:46Z
title: "gdm3 Tweaks"
tags:
  - "gdm3"
  - "gnome"
  - "Linux"
heroImage: "/blog-media/2019/07/gnomelogohorizontal.svg_.png"
description: "When setting up a new Debian Gnome it's nice to make things look the way you want. Here's a few changes I make to sort out my desktop. Hide a User from the"
---
When setting up a new Debian Gnome it's nice to make things look the way you want. Here's a few changes I make to sort out my desktop.

### Hide a User from the gdm3 Login Screen

This is how to hide a single user from the login screen - not hide all users. This is different to how it was done in earlier versions.

Create/edit a file with the users login name in `/var/lib/AccountsService/users` eg.

```
$ sudo vi /var/lib/AccountsService/users/myuser
```

Add the following or just change the `SystemAccount` value to `true`.

```
[User]
Language=
XSession=
SystemAccount=true
```

### Put the gdm3 Login Screen on Your Preferred Monitor

When Debian gets installed sometimes my monitors appear the wrong way around and my primary display is monitor 2. In user mode I can change this easy enough, but the gdm login remains the wrong way around.

The process is straight forward. Move things around as your user and then copy your user config to the gdm user. This is `Debian-gdm` for Buster but may just be `gdm` on other flavours.

```
$ sudo cp ~/.config/monitors.xml ~Debian-gdm/.config/
```

and for Ubuntu

```
$ sudo cp ~/.config/monitors.xml ~gdm/.config/
```

On Manjaro / Arch:

```
$ sudo cp ~/.config/monitors.xml /var/lib/gdm/.config/
```

### Disable User List

Prevent gdm from showing a list of users to logon with by creating `/etc/dconf/db/gdm`

```
user-db:user
system-db:gdm
file-db:/usr/share/gdm/greeter-dconf-defaults
```

Then create `/etc/dconf/db/gdm.d/00-login-screen`

```
[org/gnome/login-screen]
# Do not show the user list
disable-user-list=true
```

Update the config:

```
sudo dconf update
```

#### Linux Mint - Gnome 42

After installing Gnome 42 on Mint it took me a long time to disable the user list. I went through installing `gconf-editor` and using `gsettings` and nothing turned it off.

```
sudo gsettings get org.gnome.login-screen disable-user-list
sudo gsettings set org.gnome.login-screen disable-user-list true
```

Eventually I found `/usr/share/gdm/greeter.dconf-defaults` and uncommented the line to disable the user list.

```
# Login manager options
# =====================
[org/gnome/login-screen]
#logo='/usr/share/images/vendor-logos/logo-text-version-64.png'

# - Disable user list
disable-user-list=true
```
