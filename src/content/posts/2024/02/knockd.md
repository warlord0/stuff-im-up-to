---
pubDatetime: 2024-02-04T15:21:57Z
modDatetime: 2024-02-04T16:00:53Z
title: "knockd"
tags:
  - "iptables"
  - "Linux"
  - "Security"
heroImage: "/blog-media/2020/02/tux-1.png"
description: "Close your ssh service until you really need it, using knockd to manipulate your iptables firewall."
---
Close your `sshd` service until you really need it, using `knockd` to manipulate your `iptables` firewall.

The basic principle is that in order to get iptables to open the firewall for your ssh port, you must "knock" on some other ports in sequence first. The default is to knock on ports 7000, 8000 and 9000, to get the `knockd` service to add the firewall rule to open the `ssh` port. You then knock them again in reverse order to close it.

## Set Up and Testing

Install `iptables` on the server.

```
sudo apt install iptables iptables-persistent
```

Configure `iptables` to allow your existing connection to continue, but set the default policy to block.

```
sudo iptables -I INPUT -m conntrack --ctstate RELATED,ESTABLISHED -j ACCEPT
sudo iptables -P INPUT DROP
```

Install `knockd` on both client and server.

On the server, edit the file `/etc/knockd.conf` to specify the sequences to respond to, and the command to run - `iptables`.

Edit the file `/etc/default/knockd` to enable the service, and change the network interface.

Start the `knockd` service

```
sudo systemctl enable --now knockd.service
```

From your client, try to `ssh` onto the server. You should find you are blocked.

Now from the client `knock` on the port sequence you set for `ssh` and retry, eg.

```
knock 192.168.122.212 7000 8000 9000
ssh user@192.168.122.212
```

If you were watching the journal/syslog on the server, you should see `knockd` open the ports, and you can connect.

To close the port, simply knock the close sequence.

```
knock 192.168.122.212 9000 8000 7000
```

## Getting Clever

`knockd` doesn't just have to be used for `iptables`. You could get it to run any command when your knock sequence is heard, eg. edit a Nginx config and add a rule.

Consider adding a timer to close the port so you don't leave it open. Using this config, the `cmd_timeout` will give you 10 seconds to establish a connection after you have knocked. After 10 seconds, the `iptables` command is executed to delete the rule it just added. If you get an established connection within that 10 seconds, you will remain connected because of the `--ctstate` rule. But after you disconnect, you will need to knock again to get a new connection.

```
[openCloseSSH]
  sequence      = 1024,1025,1026
  seq_timeout   = 5
  tcpflags      = syn
  start_command = /sbin/iptables -A INPUT -s %IP% -p tcp --dport 22 -j ACCEPT
  stop_command  = /sbin/iptables -D INPUT -s %IP% -p tcp --dport 22 -j ACCEPT
  cmd_timeout   = 10
```
