---
pubDatetime: 2021-03-19T17:45:58Z
modDatetime: 2021-03-22T20:34:02Z
title: "Docker Swarm Debugging"
tags:
  - "Docker"
  - "Linux"
  - "swarm"
  - "Virtualisation"
description: "One of the most helpful pointers I found was to spin up an alpine container on the virtual network you're struggling to get connectivity over. Then you can"
---
One of the most helpful pointers I found was to spin up an alpine container on the virtual network you're struggling to get connectivity over. Then you can add some tools to the alpine image to work out what's going on.

```
docker run -it --network=proxy alpine /bin/sh

apk add busybox-tools
ping myservice

apk add nmap
nmap -T4 myservice
```

Where proxy and myservice are the network and service you interested in examining.
