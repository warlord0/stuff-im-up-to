---
pubDatetime: 2020-01-24T18:55:00Z
modDatetime: 2020-01-24T13:57:44Z
title: "OpenSSH keys and known_hosts"
tags:
  - "Linux"
  - "ssh"
description: "As I've been working on Docker containers I've been having to use local containerised versions of ssh key pairs and known_hosts . I need to be able to carr"
---
As I've been working on Docker containers I've been having to use local containerised versions of ssh key pairs and `known_hosts`. I need to be able to carry out key creation etc. without upsetting my own personal keys under `~/.ssh`.

This may be bread and butter stuff to many long time Linux admins, but it's not something I've had to do on a daily basis until recently.

### Creating a Key Pair

```
$ ssh-keygen -f rsa -b 4096 -f [key name]
```

Where I can specify the location and name of the key files to create eg.

```
$ ssh-keygen -t rsa -b 4096 -f folder/id_rsa
```

Will give me the `id_rsa` and `id_rsa.pub` files in the folder called folder.

### Updating a known_host File

If I'm using two containers and need to get the remote containers key finger prints into my local containers `known_hosts` I can use `ssh-keyscan` to grab the fingerprints and then direct them to a file. Be careful as the order of the parameters is important, especially if you have ssh daemons on different ports on the remote.

```
$ ssh-keyscan -H -p 22 [remote host] >> folder/known_hosts
```

You can change the port that the keyscan pulls fingerprints from by changing the `-p 22` to your required port.

This can even be scripted into your containers "entrypoint" so the connection is always ready and avoid the messages:

> ECDSA host key for IP address '192.168.122.99' not in list of known hosts.
>
> Host key verification failed.

### Using ssh-agent to Remember Your Password

After a while relentlessly typing your keys passphrase gets wearing. Use the `ssh-agent` in your current environment to provide it for you.

```
$ eval `ssh-agent`
$ ssh-add
```

You'll be asked for your password and then the agent will pass it along to all the future requests for that session.
