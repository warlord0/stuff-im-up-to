---
pubDatetime: 2024-12-18T10:06:11Z
modDatetime: 2025-01-02T15:52:13Z
title: "Vagrant Issues Again"
tags:
  - "Linux"
  - "vagrant"
  - "Virtualisation"
heroImage: "/blog-media/2023/12/vagrant.png"
description: "Following some more system updates, it looks like updates to ruby continue to break vagrant. I thought I'd try a different approach. Can vagrant work with"
---
Following some more system updates, it looks like updates to ruby continue to break vagrant. I thought I'd try a different approach. Can vagrant work with rbenv, which I suspect is like venv in the world of python.

I found that Manjaro has a package `rbenv-vagrant-setup` that might give me the way out of the update mess.

```
rbenv-vagrant-setup-git  v0.1.0.20241202.8b7cc32-1 [Installed]                                                                                              AUR
    A Python tool that automates the installation of Vagrant for Ruby environments managed by rbenv.
```

Then I ran:

```
rbenv-vagrant-setup
```

This is supposed to install ruby and vagrant.

It didn't quite go to plan. I had to create a missing folder `~/.rbenv`. Then further into the install had to add the `gem` folder to my path, eg.

```
rbenv global 3.2.6
set PATH $PATH:/home/paulb/.rbenv/shims/
```

When I tried `vagrant plugin install vagrant-libvirt` for the plugin , I'm back at the issue with a `bigdecimal` conflict (see [Vagrant Error after Updates](/posts/vagrant-error-after-updates/))

```
VAGRANT_DISABLE_STRICT_DEPENDENCY_ENFORCEMENT=1 vagrant plugin install vagrant-libvirt
```

Now the libvirt plugin is installed, and I'm back to having a working vagrant setup.
