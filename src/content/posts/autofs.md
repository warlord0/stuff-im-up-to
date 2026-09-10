---
pubDatetime: 2021-04-12T11:25:53Z
modDatetime: 2021-04-12T20:31:41Z
title: "AutoFS"
tags:
  - "Linux"
heroImage: "/blog-media/2020/02/tux-1.png"
description: "Using AutoFS you can automatically mount network shares onto your system. Installing it from your repository is easy enough, but some distros have slightly"
---
Using AutoFS you can automatically mount network shares onto your system. Installing it from your repository is easy enough, but some distros have slightly different locations for config files.

```
sudo apt install autofs
```

```
sudo pacman -S autofs
```

With it installed you should be able to browse to NFS systems as easily as navigating your filesystem. All you need is to know the server name. Let's say you have a server called `fs-01` that houses your NFS file shares. Just browse to your local machine at `/net/fs-01` and you should see the shares and be able to navigate to anything you have access to blow them, eg.

```
ls -l /net/fs-01
```

## Mounting Your Home Folder

With out central file server housing our users home folders I want to mount the share directly into the users home location. For this we need to add an entry to our `auto.master` file and create a new file called `auto.home`. Depeding upon your distro these should either be in `/etc/` or `/etc/autofs`.

Add the `/home` line to `auto.master`:

```
/net   -hosts
/home   /etc/autofs/auto.home   --timeout=20 --ghost
```

Create the file `auto.home` with the following content (change based on the name of your NFS server):

```
*       -fstype=nfs,vers=4.0       fs-01:/srv/share/home/&
```

What this causes to happen is the shared folder matching the user name, eg. `/srv/share/home/username` magically appears in the local folder as `/home/username` when the user logs in.

## Troubleshooting

If things go wrong you probably can't login to gdm / gui. This is probably because your home folder isn't mounting. You should still be able to get in and check this using `ssh` from another machine, or by using CTRL+ALT+F2 and logging into a terminal. You'll probably see right away that you have no home drive, but at least you'll get a basic prompt and can go about diagnosing why and fixing things.
