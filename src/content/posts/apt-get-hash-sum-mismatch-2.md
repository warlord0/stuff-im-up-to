---
pubDatetime: 2019-01-16T10:41:11Z
title: "apt-get Hash Sum Mismatch #2"
tags:
  - "Linux"
  - "updates"
description: "I'm still not sure why I'm getting this problem occur again. But when running apt-get upgrade the upgrades fail with a message like this: Get:8 http://secu"
---
I'm still not sure why I'm getting this problem occur again. But when running `apt-get upgrade` the upgrades fail with a message like this:

```
Get:8 http://security.debian.org stretch/updates/main amd64 libudev1 amd64 232-25+deb9u8 [125 kB]
 Err:8 http://security.debian.org stretch/updates/main amd64 libudev1 amd64 232-25+deb9u8
   Hash Sum mismatch
   Hashes of expected file:
 SHA256:189bfac6bfeda64bc16c74614bf524b2c431e7b6c4e3a4f786b927b84afdc889
 SHA1:6590379bbc85f8d90c05a1b32cd27dac49431b7a [weak]
 MD5Sum:40ace91d2e4c633f89d1571b3022dcdd [weak]
 Filesize:125364 [weak]
 Hashes of received file:
 SHA256:7e4f1f0e1cbcb164ddf5fd1a6d22641d91fff812220f28654a1a007749be6bac
 SHA1:7c501c7b49f4fe93d78309f5b5c635f1db487989 [weak]
 MD5Sum:9b8faa999b5db9581ef0df62f697e4df [weak]
 Filesize:877368 [weak]
 Last modification reported: Sat, 08 Dec 2018 08:05:18 +0000 
```

To resolve it I resorted to bypassing any caching and use `apt` to pull the update and upgrade:

\$ sudo apt -o Acquire::https::No-Cache=True -o Acquire::http::No-Cache=True update\
`$ sudo apt -o Acquire::https::No-Cache=True -o Acquire::http::No-Cache=True upgrade`
