---
pubDatetime: 2020-11-09T19:25:00Z
modDatetime: 2020-11-25T16:40:40Z
title: "Icinga2 Downtime Script"
tags:
  - "icinga2"
  - "Linux"
heroImage: "/blog-media/2020/06/icinga2_logo.png"
description: "I wanted to automatically trigger downtime when we ran maintenance tasks on our client systems. For this I wanted to add in a bash script to make the call"
---
I wanted to automatically trigger downtime when we ran maintenance tasks on our client systems. For this I wanted to add in a bash script to make the call to Icinga2 when we start and finish the process.

In order to do this I used a could of additional command line JSON utilities `jo` for creating JSON from parameters and `jq` for reading and processing JSON responses.

The script is flexible enough to accept parameters to control duration and either trigger a host or service downtime.

https://gist.github.com/warlord0/cc76a7fce81d1a7d8cd304f020128790
