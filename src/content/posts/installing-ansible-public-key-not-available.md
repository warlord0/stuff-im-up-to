---
pubDatetime: 2020-11-30T13:02:27Z
title: "Installing Ansible Public Key Not Available"
tags:
  - "ansible"
  - "Linux"
description: "When trying to install Ansible on Debian following the install guide here: https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.ht"
---
When trying to install Ansible on Debian following the install guide here:

[https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#installing-ansible-on-debian](https://docs.ansible.com/ansible/latest/installation_guide/intro_installation.html#installing-ansible-on-debian)

We get an error:

```
$ sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 93C4A3FD7BB9C367
 Executing: /tmp/apt-key-gpghome.rg65w1DpOn/gpg.1.sh --keyserver keyserver.ubuntu.com --recv-keys 93C4A3FD7BB9C367
 gpg: connecting dirmngr at '/tmp/apt-key-gpghome.rg65w1DpOn/S.dirmngr' failed: IPC connect call failed
 gpg: keyserver receive failed: No dirmngr
```

Then the `apt install` fails with the expected `NO_PUBKEY` error.

```
Err:1 http://ppa.launchpad.net/ansible/ansible/ubuntu trusty InRelease
   The following signatures couldn't be verified because the public key is not available: NO_PUBKEY 93C4A3FD7BB9C367
```

I don't know why it fails to find it this way as the workaround resolves the issue using the same key from the same server by adding it to the local key ring using curl instead:

```
curl -sL "http://keyserver.ubuntu.com/pks/lookup?op=get&search=0x93C4A3FD7BB9C367" | sudo apt-key add
```
