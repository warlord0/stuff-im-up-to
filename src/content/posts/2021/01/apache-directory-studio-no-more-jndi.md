---
pubDatetime: 2021-01-29T10:47:56Z
modDatetime: 2021-03-22T20:26:19Z
title: "Apache Directory Studio - No More JNDI"
tags:
  - "ldap"
  - "Linux"
heroImage: "/blog-media/2021/01/apachedirectorystudio.png"
description: "In a previous article Apache Directory Studio – JNDI I explained how to keep the JNDI connection to use LDAP over a socks proxy. It looks like this has gon"
---
In a previous article [Apache Directory Studio – JNDI](/posts/apache-directory-studio-jndi/) I explained how to keep the JNDI connection to use LDAP over a socks proxy. It looks like this has gone for good this time. The new version of Apache Directory Studio (Version: 2.0.0.v20200411-M15} does't even have the drop down in the connection settings to choose the provider.

I'm glad I kept an old version in my `~/Downloads` folder (Version: 2.0.0.v20180908-M14).

This made me come up with another solution to the problem. Rather than using a socks proxy I used a port forward with ssh.

```
ssh -L 8389:ldap:389 jump-host
```

This forwards port 8389 on my local system to port 389 on the `ldap` server via the `jump-host` connection.

I wanted this built into my socks connection. That way I only have one script to run that operates the socks proxy and the port forward for LDAP:

```
#!/bin/bash

SOCKET=~/.ssh/jump.socket
HOST="user@jump-host"
PORT=1080

ssh -M -S $SOCKET -D ${PORT} -L 8389:ldap:389 -f -C -q -N $HOST
```

To make use of it in Apache Directory Studio instead of putting the server details as `ldap:389` I use `localhost:8389` and it achieves the same thing.
