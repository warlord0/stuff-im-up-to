---
pubDatetime: 2020-01-17T19:26:00Z
modDatetime: 2020-01-17T16:28:57Z
title: "Saltstack on Debian 10"
tags:
  - "Linux"
  - "saltstack"
heroImage: "/blog-media/2020/01/saltstack.png"
description: "Following the installation guide caused a few quirks and failures on my Debian 10 install. There are a few missing packages and the bootstrap version of th"
---
Following the [installation guide](https://repo.saltstack.com/#debian) caused a few quirks and failures on my Debian 10 install. There are a few missing packages and the bootstrap version of the install puts in an incorrect repository. I had to follow the specific installation guidance for Debian 10, after I'd added in the missing packages.

Some additional apt and pip package requirements for the salt-master that are not listed, but do appear under the Github issues are as follows:

#### On the Master

```
$ sudo apt install gnupg2 python-pip python3-tornado
$ sudo pip install --upgrade --force-reinstall pyzmq
```

#### On the Minion

```
$ sudo apt install gnupg2
```

Gnupg2 is required to install the repository key. For some reason this was missing from my base install of Buster.

For a quick and dirty solution in my virtual test environment I added an entry into my `/etc/hosts` file that would allow it to find my salt master by its default name of `salt`.

```
salt    192.168.122.187
```

Once completed you can follow the post installation configuration guide and add the necessary keys to the minion and get it talking to the master.

When you get them talking you can start issuing salt instructions to the minion to make it do what you need.

```
$ sudo salt minion.domain pkg.list_pkgs
$ sudo salt minion.domain pkg.install nginx
$ sudo salt minion.domain pkg.remove nginx-common
```
