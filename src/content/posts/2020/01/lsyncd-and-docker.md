---
pubDatetime: 2020-01-29T19:41:00Z
modDatetime: 2020-01-30T08:38:48Z
title: "Lsyncd and Docker"
tags:
  - "Docker"
  - "Linux"
  - "ssh"
heroImage: "/blog-media/2020/01/moby-logo.png"
description: "Following on from Filesystem Synchronisation where a Docker container was setup to handle receiving files over rsync+ssh this handles the sending client si"
---
Following on from [Filesystem Synchronisation](/posts/filesystem-synchronisation/) where a Docker container was setup to handle receiving files over `rsync+ssh` this handles the sending client side that monitors and sends changed files over to the server using `lsyncd`.

Lsyncd uses `inotify` to pick up changes in the filesystem and then sends those changes over `rsync` to the remote server. I wanted to create a solution that handled a secure transmission of files over `ssh` to the server.

For this I didn't use a pre-existing image from a repository. I built my own using [Linux Alpine](https://www.alpinelinux.org/) as the base image. This seems common practice and seems sensible as when I began using Debian as the source my image ended up at around 150MB - with Alpine it is a tenth of that at only 15MB!

### Dockerfile

```
FROM alpine:3.11

RUN apk update
RUN apk --no-cache add openssh-client rsync lsyncd
ADD ./entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
```

This installed the components required the `open-ssh-client` to encrypt they traffic, `rsync` to do the transfer and the `lsyncd` daemon for the filesystem monitoring.

Because I wanted to pass in environment variables for parameters it made using the entrypoint the best means to inject them into the `lsyncd.conf` file.

### entrypoint.sh

```
#!/bin/sh

TARGET_HOST=${TARGET_HOST:-root@remote}
TARGET_DIR=${TARGET_DIR:-data}
TARGET_PORT=${TARGET_PORT:-9022}

cat <<EOF >/etc/lsyncd.conf
settings {
  logfile = "/dev/stdout",
  statusFile = "/var/run/lsyncd.status",
  pidfile = "/var/run/lsyncd.pid",
  nodaemon = "true"
}
sync {
  default.rsyncssh,
  source = '/mnt/data',
  host = '${TARGET_HOST}',
  targetdir = '${TARGET_DIR}',
  ssh = {
    port = ${TARGET_PORT}
  }
}
EOF

echo 'StrictHostKeyChecking=no' >> /etc/ssh/ssh_config

exec /usr/bin/lsyncd -nodaemon -delay 0 /etc/lsyncd.conf
```

In order to prevent the container from hanging and failing at the point of expecting a key fingerprint confirmation I also added in the `StrictHostKeyChecking` option into the `ssh_config`.

Build the Docker image locally:

```
$ docker build -t warlord0/lsyncd-ssh:latest . --no-cache --force-rm
```

### .env Environment

```
TARGET_HOST=root@remote # Remote host and username (if required).
TARGET_DIR=data # Folder to synchronise into
TARGET_PORT=9022 # Remote ssh port of rsync+shh host
```

### docker-compose.yml

```
version: '3'

services:
  lsyncd:
    image: warlord0/lsyncd-ssh
    volumes:
      - ./.ssh/:/root/.ssh/        # Map a local .ssh folder into root
      - ./data/:/mnt/data/         # Map the local folder to be synchronised
    environment:
      - TARGET_HOST=${TARGET_HOST}
      - TARGET_DIR=${TARGET_DIR}
      - TARGET_PORT=${TARGET_PORT}
    restart:
      always
```

The container mounts, or maps your monitored folder into the containers `/mnt/data` folder and then any changes `lsyncd` picks up will get sent to the `TARGET_HOST` on port `TARGET_PORT` into the remote folder `TARGET_DIR`.
