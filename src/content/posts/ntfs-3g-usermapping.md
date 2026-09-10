---
pubDatetime: 2020-02-01T10:41:00Z
modDatetime: 2020-02-02T16:19:53Z
title: "ntfs-3g UserMapping"
tags:
  - "Linux"
  - "Windows"
heroImage: "/blog-media/2017/12/2000px-windows_10_logo-svg.png"
description: "Never done dual boot partitioned a Windows and Linux system before and to be fair never really ever want to again. The idea is good in principle but if you"
---
Never done dual boot partitioned a Windows and Linux system before and to be fair never really ever want to again. The idea is good in principle but if you want to share a common data drive between the two you are going to have to get your hands dirty with sharing permissions between Linux and Windows.

ntfs-3g can mount a Windows ntfs partition happily in Linux, but I ran into trouble when I redirected windows documents, pictures and music folders into Linux and tried to use the same folders there.

Originally I mounted the NTFS volume onto `/home` and learned very quickly that this isn't a good idea. All sorts of issues cropped up about ownership of the `.gnupg` folder and keys. I eventually settle on mounting the volume onto `/mnt/data` and using symbolic links for David's Document, Pictures, Downloads and Music folders.

```
$ cd ~
$ ln -s /mnt/data/david/Documents
```

I mounted the Windows D: drive in Linux using an entry `/etc/fstab`:

```
UUID=176D74A26CE8F9F7 /mnt/data ntfs-3g auto 0 1
```

I wanted a seamless user experience so I could create a document or an image file in Windows and use it from the same folder in Linux. I began taking ownership of folders in Windows and then not being able to create files in Linux or vice versa.

Thankfully this was all done for one user so I set about using `UserMapping`.

The instructions I initially followed used a tool called `ntfsusermap` to create a UserMapping file based on results collected scanning a Windows volume. This didn't turn out so well for me.

I then thought all I need is the users SID from windows right? Let's just grab it with `wmic`.

```
c:\> wmic useraccount get name,sid
```

This churned out a list of all the users and their SID's which I then ported into a file called `UserMapping` in the folder `.NTFS-3G` on the root of the filesystem I am sharing - in my case `D:\` which mounts as `/mnt/data` in Linux.

I ensured the file created used Unix LF, not Windows CR+LF and ensured I kept the cases exactly `/.NTFS-3G/UserMapping`.

```
:david:S-1-5-21-3841657446-3594367465-66438089-513
:david:david:S-1-5-21-3841657446-3594367465-66438089-513
```

In Windows I then made `david` the owner of his `D:\david` folder and granted him full control and inherited and overwrote all the permissions below that.

Now when I boot into Linux I can create files in `/home/david/Documents` etc. and Windows can read, write and delete them happily.
