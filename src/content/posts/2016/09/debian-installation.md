---
pubDatetime: 2016-09-20T12:24:12Z
modDatetime: 2016-09-20T20:39:05Z
title: "Debian Installation"
tags:
  - "Linux"
  - "ssh"
  - "sudo"
  - "updates"
heroImage: "/blog-media/2016/09/debian-logo-1.png"
description: "When I setup a Debian server there's a few basic things I do to get it online. First steps boot from the netinst CD and follow the installer. First logon u"
---
When I setup a Debian server there's a few basic things I do to get it online. First steps boot from the netinst CD and follow the installer. First logon using SSH as your regular user account as root can't access the system remotely. So you'll have to logon unprivileged and then su to root.

    $ su

### Sudo

Then before doing anything else install sudo and give your user account access by making them a member of the sudo group.

    # apt-get install sudo
    # usermod -a -G sudo [user]

You'll have to logout and back in to pick-up the sudo group change.

### Automated Updates

Now setup [unattended upgrades](https://wiki.debian.org/UnattendedUpgrades) so things stay fresh.

    $ sudo apt-get install unattended-upgrades apt-listchanges
    $ sudo dpkg-reconfigure -plow unattended-upgrades

Edit the config and add your email so you get notifications about upgrades.

    $ sudo vi /etc/apt/apt.conf.d/50unattended-upgrades

and uncomment and change the detail to your email address:

    Unattended-Upgrade::Mail "root";

### SSH Secure Logon

Now create yourself an ssh key pair. This will create the ~/.ssh folder for us and place your users public and private keys in it as id_rsa (the private key) and id_ras.pub (the public key). Specify a decent password to protect your private key.

    $ ssh-keygen

You may have already done this on your own machine and already have keys. You could make life easier by using your keys to logon with ssh rather than a username and password. To do this simply copy the contents of your own id_rsa.pub file into the remote systems ~/.ssh/authorized_keys. You'll then be trusted as that user if you present your private key during logon. If you're using putty you'll need to do some conversion of the key using puttygen.

1.  Click Conversions from the PuTTY Key Generator menu and select Import key.
2.  Navigate to the OpenSSH private key and click Open.
3.  Under Actions / Save the generated key, select Save private key.
4.  Choose an optional passphrase to protect the private key.
5.  Save the private key as id_rsa.ppk.

You can then use the id_rsa.ppk file in you settings for putty to use.

### Firewall

Now I can connect to the server using SSH I'd like to keep things secure. An easily implemented firewall config I use is arno, it does all the heavy lifting with iptables. Instructions for that can be found here: [Linux Firewall](https://warlord0blog.wordpress.com/2016/01/04/linux-firewall/) Then it's over to you what you need to install on it.
