---
pubDatetime: 2023-10-07T12:35:53Z
modDatetime: 2023-10-07T15:48:58Z
title: "Uptime Kuma"
tags:
  - "Docker"
  - "Linux"
  - "Security"
heroImage: "/blog-media/2023/10/uptimekuma-3555405602.png"
description: "This is a killer application! A very elegant and simple to use system monitor. Monitor your systems' docker containers, website certificate expiry dates, D"
---
This is a killer application! A very elegant and simple to use system monitor.

Monitor your systems' docker containers, website certificate expiry dates, DNS responses, ping times, PostgreSQL query return status, MQTT, and more.

It's a very lightweight self-hosted monitoring tool.

[https://github.com/louislam/uptime-kuma](https://github.com/louislam/uptime-kuma)

Very impressed with this. Clearly, there are some more complex monitoring solutions like Nagios/Icinga, and this isn't to challenge them. This fits many simple requirements without requiring complex configuration.

I built my own `docker-compose.yml` for it and pointed my browser to [https://server:3001](#), it asks you to set up a username and password, and you're set.

```
version: '3.7'

services:
  kuma:
    image: louislam/uptime-kuma
    volumes:
      - "${PWD}/data:/app/data:rw"
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
    ports:
      - "3001:3001"
    restart: unless-stopped
    healthcheck: 
      test: [ "CMD", "curl", "--fail", "http://localhost:3001" ]
      interval: "60s"
      timeout: "5s"
      retries: 3
```
