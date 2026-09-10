---
pubDatetime: 2020-02-04T20:29:43Z
modDatetime: 2020-02-04T20:40:49Z
title: "Tunnelling RDP over SSH"
tags:
  - "Linux"
  - "ssh"
  - "Windows"
heroImage: "/blog-media/2020/02/remmina.png"
description: "After a day of battling with a very laggy and Windows bound Logmein we decided it was time to get to the customers Windows machines via a conveniently plac"
---
After a day of battling with a very laggy and Windows bound Logmein we decided it was time to get to the customers Windows machines via a conveniently placed Linux server.

It's a case of connecting to the remote server over ssh and then using port forwarding to direct traffic to the Windows RDP server. We can then run [Remmina](https://remmina.org/) to access Windows using a much smoother performing method.

I started with port forwarding manually using the shell - [SSH Tunnelling](/posts/ssh-tunnelling/). Which works just fine, but as Remmina now supports a pre and post command we can have it start and stop our tunnel for us.

Initially I started with [kgibran's script](https://kgibran.wordpress.com/2019/03/13/remmina-rdp-ssh-tunnel-with-pre-and-post-scripts/). Which sorted things for me, but has a limitation that it will only support one tunnelled RDP session at a time. This is because of the way it uses localhost on port 3389 to tunnel the connection from. We can't have two tunnels using the same local port.

So I tweaked the script slightly so I could tunnel whatever port I wanted and use as many sessions as I like.

```
#!/bin/sh

scriptname="$(basename $0)"

if [ $# -lt 3 ] 
 then
    echo "Usage: $scriptname start | stop  RDP_NODE_IP  SSH_NODE_IP SSH_LOCAL_PORT"
    exit
fi

case "$1" in

start)

  echo "Starting tunnel to $3"
  ssh -M -S ~/.ssh/$scriptname.${4:-3389}.control -fnNT -L ${4:-3389}:$2:3389 $3
  ssh -S ~/.ssh/$scriptname.${4:-3389}.control -O check $3
  ;;

stop)
  echo "Stopping tunnel to $3"
  ssh -S ~/.ssh/$scriptname.${4:-3389}.control -O exit $3 

 ;;

*)
  echo "Did not understand your argument, please use start|stop"
  ;;

esac
```

I added an optional forth parameter that specifies the local port to tunnel through and use a unique control socket for each session by adding it into the socket name.

Now you only need modify the pre/post command and server to all reference the same port eg.

```
Pre Command
/home/user/rdp-tunnel.sh start 172.10.1.200 TUNNEL_IP_HERE LOCAL_PORT
Post Command
/home/user/rdp-tunnel.sh stop 172.10.1.200 TUNNEL_IP_HERE LOCAL_PORT
Server
localhost:LOCAL_PORT
```

For example, one session I'll use port 3000 and the next port 3001. I can then have two RDP sessions open to different servers:

```
/home/user/rdp-tunnel.sh start | stop 172.10.1.200 TUNNEL_IP_HERE 3000
Server localhost:3000 
```

and

```
/home/user/rdp-tunnel.sh start | stop 172.10.1.200 TUNNEL_IP_HERE 3001
Server localhost:3001
```

Later on I may attempt to simplify things a little more by not making the repetitive use of the local port parameter, but try to have it dynamically allocate from a range.
