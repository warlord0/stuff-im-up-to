---
pubDatetime: 2020-01-28T19:47:00Z
modDatetime: 2020-01-28T09:08:30Z
title: "Filesystem Synchronisation"
tags:
  - "Docker"
  - "Linux"
  - "ssh"
heroImage: "/blog-media/2020/01/moby-logo.png"
description: "I need a repeatable process for handling synchronising files between systems. Something modular and stable. A couple of Docker containers using lsyncd and"
---
I need a repeatable process for handling synchronising files between systems. Something modular and stable. A couple of Docker containers using `lsyncd` and `sshd` should do the job.

First I started on the `sshd` side - the service that receives and hosts the replicated files. There's already a very handy container hosted on docker by [panubo/sshd](https://hub.docker.com/r/panubo/sshd). This is very close to my needs, but I'm only going to be using it for `rsync` so I want to add `rssh` to prevent any other usage of `ssh`. With a few modifications I can bring in `rssh`.

Clone the repo from [https://github.com/panubo/docker-sshd](https://github.com/panubo/docker-sshd) and use the instructions for setting it up.

### Dockerfile

```
FROM alpine:3.10

RUN apk update && \
  apk add bash git openssh rsync augeas shadow rssh && \
  deluser $(getent passwd 33 | cut -d: -f1) && \
  delgroup $(getent group 33 | cut -d: -f1) 2>/dev/null || true && \
  mkdir -p ~root/.ssh /etc/authorized_keys && chmod 700 ~root/.ssh/ && \
  augtool 'set /files/etc/ssh/sshd_config/AuthorizedKeysFile ".ssh/authorized_keys /etc/authorized_keys/%u"' && \
  echo -e "Port 22\n" >> /etc/ssh/sshd_config && \
  cp -a /etc/ssh /etc/ssh.cache && \
  rm -rf /var/cache/apk/* && \
  groupadd rsshuser && \
  chown root:rsshuser /usr/bin/rssh /usr/lib/rssh/rssh_chroot_helper && \
  chmod 550 /usr/bin/rssh && \
  chmod 4550 /usr/lib/rssh/rssh_chroot_helper && \
  echo "allowrsync" > /etc/rssh.conf && \
  chmod a+r /etc/rssh.conf

EXPOSE 22

COPY entry.sh /entry.sh

ENTRYPOINT ["/entry.sh"]

CMD ["/usr/sbin/sshd", "-D", "-e", "-f", "/etc/ssh/sshd_config"]
```

The key parts being to add the `rssh` progran to the `apk add` and then add the necessary configuration parts to `RUN` to create the group set some permissions and only `allowrsync`.

### entry.sh

https://gist.github.com/warlord0/49ee6c9fcac1d9e5337a1f32baf129aa

The main change here was to set the users shell to `/usr/bin/rssh` and specify an additional group membership for `rsshuser`:

```
getent passwd ${_NAME} >/dev/null 2>&1 || useradd -r -m -p '' -u ${_UID} -g ${_GID} -G rsshuser -s '/usr/bin/rssh' -c 'SSHD User' ${_NAME}
```

This means that when the user tries to logon using `ssh` they get denied because the setting in `/etc/rssh.conf` only allows `rsync`.

I can now target this container using `lsyncd` and have it push filesystem changes across to the `sshd` using `rsync` and the user account(s) I specified eg.

```
$ /usr/bin/lsyncd -nodaemon -delay 0 /etc/lsyncd.conf
```

### lsyncd.conf

```
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
```

This of course forms the basis for another Docker container running `lsyncd`.

**To be continued...**
