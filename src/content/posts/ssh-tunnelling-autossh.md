---
pubDatetime: 2020-01-31T19:43:00Z
modDatetime: 2020-02-12T09:03:10Z
title: "SSH Tunnelling - autossh"
tags:
  - "Linux"
  - "ssh"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "Maintaining a secure connection to a remote host using SSH to securely tunnel traffic for underlying services like MSQL, PostgreSQL or just for remote supp"
---
Maintaining a secure connection to a remote host using SSH to securely tunnel traffic for underlying services like MSQL, PostgreSQL or just for remote support is made far easier by using a tool designed to bring up the connection and monitor and maintain it.

> This is where autossh comes in.

There are times when a full blown VPN is too much. In this instance al lwe wanted was a remote system to connect to us automatically when it is powered on. We could then remotely connect to it and copy files to and from it.

Our requirement was for a reverse connection, such that the remote host didn't have any capability to do anything other than connect. We would do all the talking.

## Setup an autossh.service

Create the `/etc/systemd/system/`au`tossh.sevice` file and enable it:

```
$ sudo vi /etc/systemd/system/autossh.service
$ sudo systemctl daemon-reload
$ sudo systemctl enable autossh.service
$ sudo systemctl start autossh.service
```

### autossh.service

```
[Unit]
Description=Keeps a tunnel to '111.22.33.4' open
Wants=network-online.target
After=network.target network-online.target

[Service]
User=autossh
Restart=always
RestartSec=3
# -p [PORT]
# -l [user]
# -M 0 --> no monitoring
# -N Just open the connection and do nothing (not interactive)
# LOCALPORT:IP_ON_EXAMPLE_COM:PORT_ON_EXAMPLE_COM
Environment="AUTOSSH_GATETIME=0"
ExecStart=/usr/bin/autossh -M 0 -N -q -o "StrictHostKeyChecking no" -o "ServerAliveInterval 60" -o "ServerAliveCountMax 3" -p 22 -l userid 111.22.33.4 -R 2201:127.0.0.1:22 -i /home/autossh/.ssh/id_rsa

[Install]
WantedBy=multi-user.target
```

Where `111.22.33.4` is our local server running `sshd`. `2201` is the port we will forward to.

On the remote system we created a user called `autossh` and generated an ssh key pair for them and installed the public key into our local servers `authorized_keys` for our user `userid`.

Also in the `autohorized_keys` we disabled the remote clients ability to do anything with our server other than connect by placing the following before the key eg.

```
no-X11-forwarding,no-agent-forwarding,no-pty ssh-rsa AAAAB3Nz...
```

This means the remote system always connects and is always listed as a process on our gateway. This is a good thing as we can use monitoring tools such as Nagios to determine if the remote site is alive.

## References

[https://www.everythingcli.org/ssh-tunnelling-for-fun-and-profit-autossh/](https://www.everythingcli.org/ssh-tunnelling-for-fun-and-profit-autossh/)

[https://linux.die.net/man/8/sshd](https://linux.die.net/man/8/sshd)
