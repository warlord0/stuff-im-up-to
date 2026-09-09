---
pubDatetime: 2020-02-23T13:53:00Z
modDatetime: 2020-02-22T13:55:07Z
title: "Docker and OpenVPN"
tags:
  - "Docker"
  - "Linux"
  - "openvpn"
  - "vpn"
description: "I'm using a vpn based on OpenVPN and when I try to fire up a docker-compose set of containers it fails with: ERROR: could not find an available, non-overla"
---
I'm using a vpn based on OpenVPN and when I try to fire up a docker-compose set of containers it fails with:

> ERROR: could not find an available, non-overlapping IPv4 address pool among the defaults to assign to the network

A quick session of Duck-jitsu and I found: [https://github.com/docker/for-linux/issues/418#issuecomment-491323611](https://github.com/docker/for-linux/issues/418#issuecomment-491323611)

A few simple steps sorted it out for me. Create docker network and use an override to tell compose to use it.

```
$ docker network create localdev --subnet 10.0.1.0/24
```

### docker-compose.override.yml

```
version: '3'
networks:
  default:
    external:
      name: localdev
```

This does mean I'll have to add it into all my local projects that get pushed upstream, but I can add it to `.gitignore` to prevent it being included.
