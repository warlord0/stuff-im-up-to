---
pubDatetime: 2019-02-07T11:22:14Z
modDatetime: 2019-02-07T11:24:01Z
title: "Apt Version Pinning"
tags:
  - "JavaScript"
  - "Linux"
  - "node.js"
description: "Today after running some apt upgrades my Laravel development environment failed to compile because of a newer version of nodejs than I currently require. M"
---
Today after running some apt upgrades my Laravel development environment failed to compile because of a newer version of nodejs than I currently require.

```
Module build failed: ModuleBuildError: Module build failed: Error: Missing binding /home/paulb/itsm/node_modules/node-sass/vendor/linux-x64-64/binding.node
Node Sass could not find a binding for your current environment: Linux 64-bit with Node.js 10.x

Found bindings for the following environments:
  - Linux 64-bit with Node.js 8.x

This usually happens because your environment has changed since running `npm install`.
Run `npm rebuild node-sass` to download the binding for your current environment.
```

Turns out that Debian Buster now includes Node v10 in its repository and that overwrote my Node v8 that is used in my development. To resolve it I needed to revert back to v8 and to do this I needed to use version pinning in apt.

By using apt-cache to check the policy for nodejs I can see that I have two possible sources for it, the `debian` repository and the `nodesource` repository.

```
$ apt-cache policy nodejs
 nodejs:
   Installed: 10.15.1~dfsg-2
   Candidate: 10.15.1~dfsg-2
   Version table:
  *** 10.15.1~dfsg-2 500
         500 http://ftp.uk.debian.org/debian buster/main amd64 Packages
         100 /var/lib/dpkg/status
      8.15.0-1nodesource1 500
         500 https://deb.nodesource.com/node_8.x buster/main amd64 Packages
```

From looking at the version entries `*** 10.15.1~dfsg-2 500 `both of these packages have the same priority of 500. I need to make my 8.15 version a higher priority to ensure it gets installed instead.

To set the priority I created a file `/etc/apt/preferences.d/nodejs` and put in the following content:

```
Package: nodejs
Pin: version 8.*
Pin-Priority: 1000
```

This gives version 8.\* a priority of 1000.

```
$ apt-cache policy nodejs                                                    
 nodejs:
   Installed: 10.15.1~dfsg-2
   Candidate: 8.15.0-1nodesource1
   Version table:
  *** 10.15.1~dfsg-2 500
         500 http://ftp.uk.debian.org/debian buster/main amd64 Packages
         100 /var/lib/dpkg/status
      8.15.0-1nodesource1 1000
         500 https://deb.nodesource.com/node_8.x buster/main amd64 Packages
```

Now I need to remove and reinstall nodejs and can see that the version of node now called is back to version 8 as required.

```
$ sudo apt-get remove nodejs 
$ sudo apt-get install nodejs
$ node -v
v8.15.0
```
