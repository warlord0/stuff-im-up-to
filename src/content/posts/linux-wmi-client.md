---
pubDatetime: 2017-01-13T09:28:33Z
modDatetime: 2017-01-13T09:28:34Z
title: "Linux WMI Client"
tags:
  - "Linux"
  - "Windows"
  - "wmi"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "I'm trying to gather some inventory data from our Windows Servers and thought I'd try to do this from a Linux environment. There is a wmi client for Linux"
---
I'm trying to gather some inventory data from our Windows Servers and thought I'd try to do this from a Linux environment. There is a wmi client for Linux but doesn't seem in active development. Looks like you have to compile it yourself. So I downloaded it and tried to compile it on my Debian system and it failed with an error:

    cd Samba/source ; \
            cp bin/winexe ../../bin ; \
            cp bin/wmic ../../bin ; \
            cp bin/shared/*async_wmi_lib.so.0* ../../lib/python
    cp: cannot stat ‘bin/winexe’: No such file or directory
    cp: cannot stat ‘bin/wmic’: No such file or directory
    cp: cannot stat ‘bin/shared/*async_wmi_lib.so.0*’: No such file or directory
    make: *** [pywmi-installed] Error 1

Bit of a Google returns the necessary fix.

> Try adding compiler option `-ffreestanding`. It worked for me with Ubuntu 14.04 LTS.
>
>     make "CPP=gcc -E -ffreestanding"

### References

[https://www.aldeid.com/wiki/Wmic-linux](https://www.aldeid.com/wiki/Wmic-linux) [http://askubuntu.com/questions/473523/installing-wmic-on-ubuntu-server-12-04-lts](http://askubuntu.com/questions/473523/installing-wmic-on-ubuntu-server-12-04-lts)
