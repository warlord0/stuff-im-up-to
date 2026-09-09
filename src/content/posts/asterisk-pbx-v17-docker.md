---
pubDatetime: 2020-03-14T12:11:12Z
modDatetime: 2020-04-15T20:32:16Z
title: "Asterisk PBX v17 Docker"
tags:
  - "asterisk"
  - "Docker"
  - "Linux"
description: "In light of the possibility of many people needing to work from home the boss wanted to upgrade the phone system to bring in some fixes and new features fo"
---
In light of the possibility of many people needing to work from home the boss wanted to upgrade the phone system to bring in some fixes and new features for home working.

I've no experience of Asterisk and I'm not really a phone person, but he asked me to get a replacement system using the latest v17 release. I noticed there are v16 images available, but he was insistent upon v17. That meant building from source.

It's a week of firsts as up until now I haven't built a multi-stage Docker image either.

I tried to follow the path of building the image with Alpine as it's a tiny Linux build that is widely used for Docker builds, but I ran into an issue where I couldn't find the needed uuid library. I then went to Debian Buster.

Keeping the Dockerfile simple I put much of the make and install processes into shell scripts.

### Dockerfile

The two stage build compiles Asterisk from source and then copies the compiled assets into another image leaving behind the tools used to compile it.

```
FROM debian:buster-slim as builder

LABEL maintainer="paul.bargewell@opusvl.com"

COPY ${PWD}/make.sh /

COPY ${PWD}/entrypoint.sh /entrypoint.sh

RUN chmod +x /make.sh && /make.sh

FROM debian:buster-slim as final

COPY ${PWD}/install.sh /install.sh

RUN chmod +x /install.sh && /install.sh

COPY --from=builder --chown=asterisk:asterisk /usr/lib/libasterisk* /usr/lib/
COPY --from=builder --chown=asterisk:asterisk /usr/lib/asterisk/ /usr/lib/asterisk/
COPY --from=builder --chown=asterisk:asterisk /var/spool/asterisk/ /var/spool/asterisk/
COPY --from=builder --chown=asterisk:asterisk /var/log/asterisk/ /var/log/asterisk/
COPY --from=builder --chown=asterisk:asterisk /usr/sbin/asterisk /usr/sbin/asterisk
COPY --from=builder --chown=asterisk:asterisk /etc/asterisk/ /etc/asterisk/
COPY --from=builder --chown=asterisk:asterisk /etc/init.d/asterisk /etc/init.d/
COPY --from=builder --chown=asterisk:asterisk /var/lib/asterisk/ /var/lib/asterisk/

COPY --from=builder /entrypoint.sh /entrypoint.sh

EXPOSE 5060/udp 5060/tcp 8088/tcp 5038/tcp

VOLUME /var/lib/asterisk/sounds /var/lib/asterisk/keys /var/lib/asterisk/phoneprov /var/spool/asterisk /var/log/asterisk /etc/asterisk

ENTRYPOINT [ "/entrypoint.sh" ]
```

### make.sh

The make script is used by the fist stage of the build. It pulls down the required tools to compile from source and the prerequisites for Asterisk.

```
#!/bin/sh

apt-get update

apt-get install -y \
  build-essential \
  curl \
  git \
  gzip \
  libedit-dev \
  libjansson-dev \
  libldap2-dev \
  libncurses5-dev \
  libsqlite3-dev \
  libsrtp2-dev \
  libssl-dev \
  libuuid1 \
  libxml2-dev \
  odbc-postgresql \
  openssl \
  postgresql-client \
  sqlite3 \
  tar \
  unixodbc \
  unixodbc-dev \
  uuid-dev \
  wget

git clone https://github.com/asterisk/asterisk.git /asterisk
cd /asterisk
./configure
make
make menuselect
make install
make config
make samples

cd /tmp
wget https://downloads.digium.com/pub/telephony/codec_opus/asterisk-17.0/x86-64/codec_opus-17.0_current-x86_64.tar.gz
tar xvzf codec_opus-17.0_current-x86_64.tar.gz
cp codec_opus-17.0_1.3.0-x86_64/*.so /usr/lib/asterisk/modules/
cp codec_opus-17.0_1.3.0-x86_64/codec_opus_config-en_US.xml /var/lib/asterisk/documentation/thirdparty
```

### install.sh

The install script is run as part of the second stage and doesn't require the compile/build tools. This results in a much smaller image at 380MB, as the first stage comes in a whopping 2.5GB!

```
#!/bin/sh

apt-get update

apt-get install -y \
  festival \
  libedit-dev \
  libjansson-dev \
  libldap2-dev \
  libncurses5-dev \
  libsqlite3-dev \
  libsrtp2-dev \
  libssl-dev \
  libuuid1 \
  libxml2-dev \
  odbc-postgresql \
  openssl \
  postgresql-client \
  supervisor \
  unixodbc \
  unixodbc-dev \
  uuid-dev

apt-get autoclean

useradd asterisk
echo "asterisk:Obelix" | chpasswd
```

### entrypoint.sh

Make sure the `asterisk` user can access the required folders and starts the program in the foreground.

```
#!/bin/sh

if [ "$1" = "" ]; then
  COMMAND="/usr/sbin/asterisk -T -W -U asterisk -p -nvvvdddf"
else
  COMMAND="$@"
fi

chown -R asterisk:  /var/log/asterisk \
                    /var/lib/asterisk \
                    /var/run/asterisk \
                    /var/spool/asterisk
exec ${COMMAND}
```

Because the sample configuration is included the `/etc/asterisk` folder already has the configuration ready to go. We can then pull the files from the image and include them in a volume mount so we can customise them as required.

## References

[http://www.asteriskdocs.org/en/3rd_Edition/asterisk-book-html-chunk/installing_how_to_install_it.html](http://www.asteriskdocs.org/en/3rd_Edition/asterisk-book-html-chunk/installing_how_to_install_it.html)
