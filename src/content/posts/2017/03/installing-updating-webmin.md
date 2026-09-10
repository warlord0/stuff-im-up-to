---
pubDatetime: 2017-03-01T09:56:37Z
modDatetime: 2017-03-01T10:01:22Z
title: "Installing / Updating Webmin"
tags:
  - "Linux"
heroImage: "/blog-media/2017/03/webmin_logo.png"
description: "We've got webmin installed on a number of our Debian Linux boxes. In our environment many of these servers don't have full and open access to the internet"
---
We've got webmin installed on a number of our Debian Linux boxes. In our environment many of these servers don't have full and open access to the internet so aren't capable of going out and updating from the webmin site. To get our updates we must download the .deb file using a client system from the [webmin download page](http://www.webmin.com/download.html) and then copy it to the server using scp.

    $ scp webmin_[VERSION]_all.deb [SERVER]:~/

Then just ssh onto the server and install the update using:

    $ sudo dpkg -i ~/webmin_[VERSION]_all.deb
    (Reading database ... 53365 files and directories currently installed.)
    Preparing to replace webmin VERSION (using webmin_VERSION_all.deb) ...
    Unpacking replacement webmin ...
    Setting up webmin (VERSION) ...
    Webmin install complete. You can now login to https://SERVER:10000/
    as root with your root password, or as any user who can use sudo
    to run commands as root.

This does a straightforward update if it exists, or a new install if it doesn't.
