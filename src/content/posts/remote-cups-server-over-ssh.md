---
pubDatetime: 2023-01-21T19:09:58Z
modDatetime: 2023-01-21T19:14:29Z
title: "Remote CUPS Server over SSH"
tags:
  - "autossh"
  - "cups"
  - "Linux"
  - "ssh"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "Hosting a customer's web service for ERP systems means the hosted system has limited options of sending printable material to the end user. Usually it invo"
---
Hosting a customer's web service for ERP systems means the hosted system has limited options of sending printable material to the end user. Usually it involves printing a web page from the browser, or having the server convert the document to a PDF that the user then downloads and is able to print locally.

When it comes to printing to a label printer, the conversion to PDF and printing to scale, and guaranteeing the positioning of label elements is unreliable. What we need to do is print directly to the label printer from the web service, using the printers native print drivers.

To do this, we put a CUPS print server at the remote user's location and connect it to their local printer using any CUPS supported method, such as direct USB or over the network using LPR/D.

## How do we get the ERP server to talk to CUPS?

Once on the remote user's network, the CUPS server connects to the ERP server over the internet using an encrypted connection using SSH. This needs to happened automatically and with zero user interaction on the CUPS server.

Using AutoSSH we can use a key pair that is generated on the CUPS server to connect back to the ERP system. Then, using the SSH ability to forward a remote port, we can make the CUPS printer port become available directly for the ERP server to use as if it had its own CUPS server.

> This does not have to apply to only ERP. It can be applied to any server that can print to cups.

## The CUPS Server

We don't need a highly capable device to be able to install CUPS. It can even be done using a Raspberry Pi. For not a great deal more, we can buy a mini PC with a quad-core Celeron, 8 GB RAM and 128 GB of storage - more than enough to run CUPS reliably.

I'm not going to go into managing the CUPS server and adding printers. I'll assume you know how to connect to a CUPS server using [https://cups:631](#) and administer it.

By using AutoSSH the remote CUPS server connects automatically as soon as it is on a network. The benefit here is that it does not matter what network it is on, it only has to be on the internet. It means we don't need to know its IP address for it to work - although it's a good idea to get it added to your firewall.

### AutoSSH

Assuming you have Linux installed onto the small remote device, you should install AutoSSH.

```
sudo apt install autossh
```

Create an `autossh` user with a disabled password and even disable it's ability to logon to a terminal.

Generate a public/private key pair for the `autossh` user, leaving the password empty.

```
sudo -u autossh ssh-keygen -t ed25519 -a 200
```

We will need the public key from `/home/autossh/.ssh/id_ed25519.pub` later.

Create a systemd service file for the autossh service as `/etc/systemd/system/autossh.service`.

```
[Unit]
Description=Keeps a tunnel to ERP system open
Wants=network-online.target
After=network.target network-online.target

[Service]
User=autossh
Restart=always
RestartSec=3
ExecStart=/usr/bin/autossh -M 0 -N -q -o "StrictHostKeyChecking no" -o "ServerAliveInterval 60" -o "ServerAliveCountMax 3" -p 22 -l remote_cups erp.domain.tld -R 8631:0.0.0.0:631 -i /home/autossh/.ssh/id_ed25519 -o UserKnownHostsFile=/dev/null

[Install]
WantedBy=multi-user.target
```

Change the `erp.domain.tld` for your ERP systems external IP address and the `-p 22` to the `sshd` port you use, if it's not the default.

Update the systemd daemon using:

```
sudo systemctl daemon-reload
```

### SSH Server

Create a user on the local ERP system that the CUPS server will connect as. Again this should have a disabled password as we intend for it only to use public/private key authentication and encryption.

```
sudo adduser remote_cups --disabled-password --gecos "Remote CUPS Server" --force-badname
```

Take the `id_ed25519.pub` file we generated on the remote system and put it into `~/.ssh/authorized_keys` for the `remote_cups` user we created.

Whilst you are pasting in the key, you could add the following to prefix the line:

```
no-agent-forwarding,no-pty 
```

So it looks something like this:

```
no-agent-forwarding,no-pty ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIM....
```

This will prevent the `remote_cups` user from doing anything with a terminal into the ERP system's network. You can achieve the same aims in `sshd_config` (see below).

### Starting AutoSSH

On the remote CUPS server, enable and start the `autossh` service.

```
sudo systemctl enable --now autossh.service
```

You can then monitor the logs to ensure `autossh` connects.

```
sudo tail -f /var/log/syslog
```

The ERP system should now be able to connect to the remote CUPS server as if it were local on:

```
localhost:8631
```

If you are able, you can use a browser on the ERP server to browse to the CUPS GUI at:

https://localhost:8631

- We use port 8631 because ports below 1024 are privileged ports and not available to non-root users.

## Expanding on this

### Allow Any System

If you wanted more than just the ERP system to be able to print to the remote CUPS server you can alter the `autossh.service` and get the CUPS port 8631 to bind to all IP addressed on the ERP system - by default it is available on 127.0.0.1 (localhost) only.

Modify the `ExecStart` line, such the `-R 8631:0.0.0.0:631` becomes `-R 0.0.0.0:8631:0.0.0.0:631`

```
ExecStart=/usr/bin/autossh -M 0 -N -q -o "StrictHostKeyChecking no" -o "ServerAliveInterval 60" -o "ServerAliveCountMax 3" -p 22 -l remote_cups erp.domain.tld -R 0.0.0.0:8631:0.0.0.0:631 -i /home/autossh/.ssh/id_ed25519 -o UserKnownHostsFile=/dev/null
```

You must then allow `GatewayPorts` by editing the ERP servers `/etc/ssh/sshd_config`, and setting:

```
GatewayPorts yes
```

or allow it only for the specific user `remote_cups`:

```
Match User remote_cups
    AllowAgentForwarding no
    PermitTTY no
    ForceCommand /usr/bin/nologin
    GatewayPorts yes
```

### Remote Support

If you would like to be able to logon to the remote CUPS server using SSH, you can add another `-R` option - `-R 8022:127.0.0.1:22`.

```
ExecStart=/usr/bin/autossh -M 0 -N -q -o "StrictHostKeyChecking no" -o "ServerAliveInterval 60" -o "ServerAliveCountMax 3" -p 22 -l remote_cups erp.domain.tld -R 0.0.0.0:8631:0.0.0.0:631 -R 8022:127.0.0.1:22 -i /home/autossh/.ssh/id_ed25519 -o UserKnownHostsFile=/dev/null
```

Now you can connect to it from the ERP system using:

```
ssh user@localhost -p 8022
```

Where user is the name of a user on the remote CUPS server you can use for admin. This could even be `root` if you have `authorized_keys` for `root`, as by default a password is denied.

### Does it have to connect to my ERP server

#### No

Take from the above that it can connect to any ssh server, and if you read the section to **Allow Any System,** you can use that approach to treat your ERP system as the ANY system.
