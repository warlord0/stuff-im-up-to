---
pubDatetime: 2019-02-27T14:57:55Z
title: "Chocolatey Package Manager"
tags:
  - "Windows"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "Using package managers is second nature in Linux, but in Windows you get free reign to go download and install anything you like from anywhere. Not a bad t"
---
Using package managers is second nature in Linux, but in Windows you get free reign to go download and install anything you like from anywhere. Not a bad thing, but when you have a host of packages installed, keeping them all up to date can be frustrating. That's where "[chocolatey](https://chocolatey.org/)" comes in.

Chocolatey is a windows package manager based on Powershell. You can use it in the same sort of way you'd use a Linux repository using `choco install` or `choco uninstall` to download and install packages.

But there is a GUI. Once you have installed chocolatey just use the installer (from the command line) to install the GUI:

```
C:\> choco install chocolateygui 
```

If you then use it to install all your required programs such as 7-Zip, Git, Java SE, Notepad++, VirtualBox, inkscape, etc. then each time you visit the GUI you can just click to upgrade everything and it will go fetch and install the latest version of all the software you used chocolatey to install.
