---
pubDatetime: 2016-09-27T10:16:25Z
modDatetime: 2016-09-27T10:17:28Z
title: "SSH Tunnelling"
tags:
  - "Linux"
  - "ssh"
description: "Every so often I get caught out by not being able to access a remote server because of my firewall config. Not allowed to remotely access a resource unless"
---
Every so often I get caught out by not being able to access a remote server because of my firewall config. Not allowed to remotely access a resource unless you're from a trusted subnet. So the way round this is use an intermediary that is in a trusted subnet. SSH has a feature that will allow me to pretend a local port on my PC is actually a port on a remote system. It's called tunnelling. As long as I can SSH onto the intermediary and tunnelling is not disabled I can for example pretend that tcp port 2000 on my local machine is actually the tcp port 3389 (remote desktop) on another system.

    $ ssh -f [intermediary] -L 2000:[remote]:3389 -N

Where the intermediary is your ssh host and may be in the form username@server and remote is the system you want to RDP to. If you want to use a different local port, change the 2000 to suit and if you want to use some other service than RDP change the 3389 port as necessary. When you're done you can close the tunnel by killing the ssh process. You'll need to find the process id first.

    $ ps aux | grep [remote]

Which should return something like:

    myuser     5906  0.0  0.0  50612   736 ?        Ss   10:59   0:00 ssh -f intermediary -L 2000:[remote]:3389 -N

Take the process id from the second column and kill it using:

    $ kill 5906

### Using the Remote System

If you now connect to your localhost on port 2000 using your RDP client you should find you get a logon to the remote server, not your own PC. This will probably give you some certificate issues as the certificate used on the remote server is not called "localhost". You'll need to accept this to connect. Similarly any system that uses certificates is not going to be able to be validated over this localhost connection.

### SSH Switches

-f = Start ssh in background mode -L = Local port to use -N = Don't run an SSH command on the intermediary If you omit -f you can leave a terminal running the process and then go off to another to use your remote connection. Then to close it you just do a CTRL+C in the terminal to kill the ssh process.
