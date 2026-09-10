---
pubDatetime: 2020-05-18T11:22:00Z
modDatetime: 2020-05-25T09:25:18Z
title: "SSH and SOCKS"
tags:
  - "Linux"
  - "proxy"
  - "ssh"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "Here's my handy script for bringing a socks proxy up and down. Saves the hassle of finding the PID of the ssh proxy process to kill it when you're done. so"
---
Here's my handy script for bringing a socks proxy up and down. Saves the hassle of finding the PID of the ssh proxy process to kill it when you're done.

#### socks.sh

```
#!/bin/bash

SOCKET=~/.ssh/jump.socket
HOST="myuser@gateway.domain.tld -p 22"
PORT=8123

case "$1" in
up|UP)
  if [ -e ${SOCKET} ]; then
    ssh -S $SOCKET -O check ${HOST} > /dev/null
    if [ $? -ne 0 ]; then
      rm -f ${SOCKET}
    else
      ssh -S ${SOCKET} -D ${PORT} -f -C -q -N ${HOST}
    fi
  else
    ssh -M -S ${SOCKET} -D ${PORT} -f -C -q -N ${HOST}
  fi
  ssh -S ${SOCKET} -O check ${HOST}
  ;;
down|DOWN)
  if [ -e ${SOCKET} ]; then
    ssh -S ${SOCKET} -O check ${HOST} > /dev/null
    if [ $? -eq 0 ]; then
      ssh -S $SOCKET -O exit ${HOST}
    fi
  else
    echo "Already down"
  fi
  if [ -e ${SOCKET} ]; then
    rm -f ${SOCKET}
  fi
  ;;
*)
  echo "USAGE:"
  echo "Bring the socks proxy up using:"
  echo "  ./socks.sh up"
  echo "Take the socks proxy down using:"
  echo "  ./socks.sh down"
  ;;
esac
```

> You may want to look at other ports to use other than 1080. Whilst 1080 is a popular socks port it conflicts with docker, so I tend to use an unused port of 8123.
