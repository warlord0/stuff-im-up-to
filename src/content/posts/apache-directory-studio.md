---
pubDatetime: 2018-04-19T13:34:02Z
modDatetime: 2021-01-29T11:08:31Z
title: "Apache Directory Studio"
tags:
  - "ldap"
  - "Linux"
description: "After upgrading Directory Studio - which is a simple case of extracting the tar.gz file into the location you want the executable eg. $ cd /usr/bin $ sudo"
---
After upgrading Directory Studio - which is a simple case of extracting the tar.gz file into the location you want the executable eg.

    $ cd /usr/bin
    $ sudo tar xvzf ~/Downloads/ApacheDirectoryStudio-2.0.0.v20170904-M13-linux.gtk.x86_64.tar.gz

I got this error in the log file when running the new version.

    org.osgi.framework.BundleException: Unable to acquire the state change lock for the module: osgi.identity;

After Googling and coming up with lock file errors in regard to Eclipse, the easiest solution for me was to just remove it and reinstall it all. However, if you're using Eclipse for things other than Directory Studio eg. the Eclipse IDE You may find this problematic and have to be more selective about the components you delete under the `~/.eclipse` folder.

    $ rm -Rf ~/.eclipse
    $ sudo rm -Rf /usr/bin/ApacheDirectoryStudio

    $ cd /usr/bin
    $ sudo tar xvzf ~/Downloads/ApacheDirectoryStudio-2.0.0.v20170904-M13-linux.gtk.x86_64.tar.gz
