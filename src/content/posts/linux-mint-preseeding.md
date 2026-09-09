---
pubDatetime: 2020-02-21T20:31:14Z
modDatetime: 2020-02-21T20:36:03Z
title: "Linux Mint Preseeding"
tags:
  - "Linux"
description: "Well that was a really tough day. Turns out we have a kinda favouritism for Linux Mint on Desktops. Preseeding for Linux Mint kinda works the same was as D"
---
Well that was a really tough day. Turns out we have a kinda favouritism for Linux Mint on Desktops. Preseeding for Linux Mint kinda works the same was as Debian, but doesn't.

Linux Mint uses the Ubuntu flavour of preseeding and uses it's own ubiquity install process that uses some of the `d-i` values, but also many of it's own. Sadly this is nowhere near as documented as the Debian example. When things didn't work as expected where do I look for help and documentation?

I found some help, from another party, but for installing in German. I figured a few changes to 'uk' instead of 'de' would be in order - then smiled as the installer turned Cyrillic as it decided 'uk' must mean 'ukraine'!

I battled on and got the installation completed in English with a UK keyboard - success! Well, let's not celebrate just yet.

My next step is to fire up Ansible and run a playbook on the new machine, only to find it's not accepting connections on port 22. "What, no openssh-server?"

I checked the config. It's in there. So I tried to install it manually on the freshly prepared desktop:

```
$ sudo apt-get install openssh-server
```

It fails to install because the dependency is for a version of `openssh-sftp-server` that does not come with this 19.3 Tricia installation\! This is a serious flaw. Out of the box you can't install `openssh-server` without doing an `apt update` to get an updated repository from online that fills this void.

```
$ sudo apt update
$ sudo apt-get install openssh-server
```

Now I get a working ssh daemon and can use Ansible. How do I automate this step? It has to go into the `preseed.cfg` surely? I tried using late_command and ubiquity success to call a script and cannot get it to work in an automated fashion.

```
ubiquity ubiquity/success_command string \
apt-get update && apt-get install -y openssh-server
```

The `d-i` late_command version:

```
d-i preseed/late_command string in-target apt-get update && apt-get install -y openssh-server
```

So now I'm stuck with a semi-automated process for Linux Mint until I can get this resolved.
