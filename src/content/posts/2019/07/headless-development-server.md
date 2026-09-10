---
pubDatetime: 2019-07-02T21:14:39Z
modDatetime: 2019-07-02T21:18:12Z
title: "Headless Development Server"
tags:
  - "Linux"
  - "Windows"
heroImage: "/blog-media/2019/07/x-window1.png"
description: "After building a development environment in Linux as per a previous article - https://warlord0blog.wordpress.com/2018/07/13/building-a-debian-development-s"
---
After building a development environment in Linux as per a previous article - [https://warlord0blog.wordpress.com/2018/07/13/building-a-debian-development-server/](https://warlord0blog.wordpress.com/2018/07/13/building-a-debian-development-server/) I decided I wanted something a bit more portable in terms of development tools.

I could go install VSCode/Atom etc. onto the local OS and point at a shared folder on the dev machine to edit files. But the problem with that is running terminals from VSCode/Atom and trying to have the IDE handle filesystem changes on the remote host without breaking my Git commits and causing mayhem.

> **Q.** What tools do I have in my toolbox that will make me best able to handle remote development without resorting to VNC?

**A.** **[SmarTTY](http://sysprogs.com/SmarTTY/)** and a Linux X Windows server should do nicely.

Hopefully you already have SmarTTY installed. If not grab it an install it on your windows box. It comes with XMing and vcxsrv built in. We can run remote X packages straight from SmartTTY!

One thing I need on my virtual dev server is a GUI environment. My go to setup is CLI only, but as I want to use remote X packages I'm going to need to install a GUI desktop manager of some kind. My dev server is Debian, so I installed cinnamon, but I guess it could be any desktop like Gnome or KDE.

```
$ sudo apt-get install cinnamon
```

This will churn for a while as it downloads all the required X Windows environment needed by cinnamon. Installing it this way means it installs the necessary files, but doesn't become active. Our headless virtual dev server stays CLI based on terminal console login .

Once complete download and copy VSCode to the dev server and install it using `dpkg`. It may complain about missing dependencies, just run `install -f` and let it install the dependencies and finish installing VSCode.

```
$ sudo dpkg -i ./code_1.35.1-1560350270_amd64.deb
$ sudo apt-get install -f
```

Now the magic can happen. To run VSCode as a windows X package all we do is call it from the SmarTTY CLI. It will try to start an X session and ask you if you want `vcxsrv` or `xming` - choose the default `vcxsrv` and up pops VScode as a window in windows.

```
$ code
```

You can verify it's running from your Linux box by trying to open a file. It shows you the remote Linux file system, not your local windows.

If you go to Help, About you will see it's the Linux version.

![Visual Studio - Help, About](/blog-media/2019/07/image.png)

Now I can take my virtual image with me and run it on almost any winodws box with my preferred IDE, plugins and dev environment.
