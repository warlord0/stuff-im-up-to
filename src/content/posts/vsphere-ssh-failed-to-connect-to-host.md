---
pubDatetime: 2017-11-17T12:31:47Z
modDatetime: 2017-11-17T12:32:36Z
title: "vSphere SSH failed to connect to host"
tags:
  - "Linux"
  - "updates"
  - "vmware"
description: "When trying to apply patches to one of our ESXi 6.0 hosts I found I couldn't connect to it using ssh. Stopping and starting SSH from vCenter didn't work. Neither did disabling/enabling from the DCUI."
---
When trying to apply patches to one of our ESXi 6.0 hosts I found I couldn't connect to it using ssh. Stopping and starting SSH from vCenter didn't work. Neither did disabling/enabling from the DCUI. From my client I'd see:

    ssh_exchange_identification: Connection closed by remote host

So then I resorted to checking out the server from the console. First make sure I stopped SSH from either of the GUI's. Use ALT-F1 at the DCUI and logon to the host using your root account. Then I tried to start sshd as a daemon using:

    # /usr/lib/vmware/openssh/bin/sshd -D

Which reported errors `Unsupported option running` and `Unsupported option PrintLastLog` So I editted my `/etc/ssh/sshd_config` file. Don't know what caused it. But it was just a \# missing from the first line. I guess I must have spannered it at some point when editing it to disable some ciphers. But the good news is using this method I can at least get some clear output from `sshd -D` to tell me why it wasn't starting properly.

    # running from inetd
    # Port 2200
    Protocol 2
    HostKey /etc/ssh/ssh_host_rsa_key
    HostKey /etc/ssh/ssh_host_dsa_key

    UsePrivilegeSeparation no

    SyslogFacility auth
    LogLevel info

    PermitRootLogin yes

    PrintMotd yes
    PrintLastLog no

    TCPKeepAlive yes

    X11Forwarding no

    ...

So just to be safe I checked the other hosts and copied an `sshd_config` from one of the known good ones.
