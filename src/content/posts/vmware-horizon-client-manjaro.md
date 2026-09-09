---
pubDatetime: 2021-01-18T17:58:00Z
modDatetime: 2021-01-18T12:10:43Z
title: "VMWare Horizon Client (manjaro)"
tags:
  - "Linux"
  - "manjaro"
  - "vmware"
description: "I've been playing with Manjaro and the package management is way different to Debian. I needed to get some work tools installed and the VMWare Horizon Clie"
---
I've been playing with Manjaro and the package management is way different to Debian. I needed to get some work tools installed and the VMWare Horizon Client is needed for one of our support customers.

Initially I downloaded the bundle from VMWare and that failed miserably, but that's not surprising as the only support they list is for Ubuntu and RedHat.

Then I came across the AUR.

I found the Horizon client in a package here: [https://aur.archlinux.org/packages/vmware-horizon-client/](https://aur.archlinux.org/packages/vmware-horizon-client/)

The steps required are clone the git and run makepkg and then install the generated tar file using pacman.

```
git clone https://aur.archlinux.org/vmware-horizon-client.git
cd vmware-horizon-client
makepkg
sudo pacman -U vmware-horizon-client-2012-1-x86_64.pkg.tar.zst
```

This failed as it was missing a dependency `vmware-keymaps`. It does say it's a dependency on the AUR page.

Now it's just a case of grabbing that package and making and installing it first. [https://aur.archlinux.org/packages/vmware-keymaps/](https://aur.archlinux.org/packages/vmware-keymaps/)

```
cd ..
git clone https://aur.archlinux.org/vmware-keymaps.git
cd vmware-keymaps
makepkg
sudo pacman -U vmware-keymaps-1.0-1-any.pkg.tar.zst 
```

Then back to install the client:

```
cd ../vmware-horizon-client
sudo pacman -U vmware-horizon-client-2012-1-x86_64.pkg.tar.zst
```

I don't want or need all the other stuff like multimedia redirection and usb redirection. The customers security setup doesn't allow any of that anyway. Now all I have to do is launch it from my list of apps.
