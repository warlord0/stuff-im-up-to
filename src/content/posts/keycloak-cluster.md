---
pubDatetime: 2021-11-28T16:54:10Z
modDatetime: 2021-11-30T09:06:11Z
title: "Keycloak Cluster"
tags:
  - "Docker"
  - "keycloak"
  - "Linux"
  - "oauth2"
  - "postgresql"
description: "As resilient as our docker build is I'd like to extend it to a clustered instance of Keycloak. This way, I can load balance a pair of docker containers and"
---
As resilient as our docker build is I'd like to extend it to a clustered instance of Keycloak. This way, I can load balance a pair of docker containers and maintain an even higher uptime. The model I've chosen is the standalone HA method. This gives me two Keylcoak instances and a single back end database.

I wanted to build this across a data centre in two different virtual hosts, connected to the same network. I'm also going to replicate the postgres database between systems using repmgr.

First thing is to prepare the environment and allow firewall connections between the virtuals on TCP ports 5432 (for postgres) and TCP port 7600 (for Keycloak TCPPING). Then I need acess to TCP port 8080 (for the Keycloak web interface) from the load balancer. I'll be using TLS termination on the load balancer/reverse proxy to handle the certificates.

## Primary - docker-compose.yml

```
---
version: "3.2"

services:

  keycloak-0:
    extra_hosts:
      pg-0: ${PRIMARY_IP?REQUIRED}
      pg-1: ${SECONDARY_IP?REQUIRED}
    image: ${KEYCLOAK_IMAGE:-quay.io/keycloak/keycloak}:${KEYCLOAK_IMAGE_VERSION:-latest}
    environment:
      KEYCLOAK_USER: ${KEYCLOAK_USER:-admin}
      KEYCLOAK_PASSWORD: ${KEYCLOAK_PASSWORD?REQUIRED}
      KEYCLOAK_LOGLEVEL: ${KEYCLOAK_LOGLEVEL:-INFO}
      ROOT_LOGLEVEL: ${KEYCLOAK_LOGLEVEL:-INFO}
      KEYCLOAK_STATISTICS: ${KEYCLOAK_STATISTICS:-all}
      DB_ADDR: pg-0
      DB_PORT: 5432
      DB_VENDOR: postgres
      DB_DATABASE: ${KEYCLOAK_DATABASE:-keycloak}
      DB_USER: ${KEYCLOAK_POSTGRES_USER:-keycloak}
      DB_PASSWORD: ${KEYCLOAK_POSTGRES_PASSWORD?REQUIRED}
      PROXY_ADDRESS_FORWARDING: ${PROXY_ADDRESS_FORWARDING:-true}
      KEYCLOAK_CREATE_ADMIN_USER: "true"
      JGROUPS_DISCOVERY_PROTOCOL: TCPPING
      JGROUPS_DISCOVERY_EXTERNAL_IP: ${PRIMARY_IP?REQUIRED}
      JGROUPS_DISCOVERY_PROPERTIES: initial_hosts="${PRIMARY_IP?REQUIRED}[7600],${SECONDARY_IP?REQUIRED}[7600]"
      KEYCLOAK_CACHE_OWNERS_COUNT: 2
      KEYCLOAK_AUTH_CACHE_OWNERS_COUNT: 2
    ports:
      - "8080:8080"
      - "7600:7600"
    depends_on:
      - pg-0

  pg-0:
    extra_hosts:
      pg-0: ${PRIMARY_IP?REQUIRED}
      pg-1: ${SECONDARY_IP?REQUIRED}
    image: ${POSTGRES_IMAGE:-docker.io/bitnami/postgresql-repmgr}:${POSTGRES_IMAGE_VERSION:-11}
    ports:
      - 5432:5432
    environment:
      - POSTGRESQL_POSTGRES_PASSWORD=${POSTGRES_PASSWORD?REQUIRED}
      - POSTGRESQL_USERNAME=${KEYCLOAK_POSTGRES_USER:-keycloak}
      - POSTGRESQL_PASSWORD=${KEYCLOAK_POSTGRES_PASSWORD?REQUIRED}
      - POSTGRESQL_DATABASE=${KEYCLOAK_DATABASE:-keycloak}
      - REPMGR_PASSWORD=${REPMGR_PASSWORD?REQUIRED}
      - REPMGR_PRIMARY_HOST=${PRIMARY_IP?REQUIRED}
      - REPMGR_PRIMARY_PORT=5432
      - REPMGR_PARTNER_NODES=${PRIMARY_IP?REQUIRED}:5432,${SECONDARY_IP?REQUIRED}:${PORTBASE?REQUIRED}02
      - REPMGR_NODE_NAME=pl-0
      - REPMGR_NODE_NETWORK_NAME=${PRIMARY_IP?REQUIRED}
      - REPMGR_PORT_NUMBER=5432
    volumes:
      - "${CONTAINER_VOLUME?REQUIRED}/${SERIAL?REQUIRED}/postgres:/bitnami/postgresql:rw"
```

Ass with almost all my compose files I drive it with environment variables from `.env`.

Some key points of note here are the primary and secondary ip's that are used to set extra hosts `pg-0` and `pg-1`. This allows me to refer to each virtual machine ip as a name within the docker network. I also use them to configure the TCPPING for the Keycloak cluster.

## Secondary - docker-compose.yml

This is almost identical to the primary, with the exception the names are sufficed `-1`. The items to pay attention to are that I am still connecting the `keycloak-1` instance to the database on `pg-0` - this is because `pg-1` is a read only replica. I also changed the `REPMGR_NODE_NAME`. There is also no need for `keycloak-1` to depend on `pg-1`.

```
---
version: "3.2"

services:

  keycloak-1:
    extra_hosts:
      pg-0: ${PRIMARY_IP?REQUIRED}
      pg-1: ${SECONDARY_IP?REQUIRED}
    image: ${KEYCLOAK_IMAGE:-quay.io/keycloak/keycloak}:${KEYCLOAK_IMAGE_VERSION:-latest}
    environment:
      KEYCLOAK_USER: ${KEYCLOAK_USER:-admin}
      KEYCLOAK_PASSWORD: ${KEYCLOAK_PASSWORD?REQUIRED}
      KEYCLOAK_LOGLEVEL: ${KEYCLOAK_LOGLEVEL:-INFO}
      ROOT_LOGLEVEL: ${KEYCLOAK_LOGLEVEL:-INFO}
      KEYCLOAK_STATISTICS: ${KEYCLOAK_STATISTICS:-all}
      DB_ADDR: pg-0
      DB_PORT: 5432
      DB_VENDOR: postgres
      DB_DATABASE: ${KEYCLOAK_DATABASE:-keycloak}
      DB_USER: ${KEYCLOAK_POSTGRES_USER:-keycloak}
      DB_PASSWORD: ${KEYCLOAK_POSTGRES_PASSWORD?REQUIRED}
      PROXY_ADDRESS_FORWARDING: ${PROXY_ADDRESS_FORWARDING:-true}
      KEYCLOAK_CREATE_ADMIN_USER: "true"
      JGROUPS_DISCOVERY_PROTOCOL: TCPPING
      JGROUPS_DISCOVERY_EXTERNAL_IP: ${PRIMARY_IP?REQUIRED}
      JGROUPS_DISCOVERY_PROPERTIES: initial_hosts="${PRIMARY_IP?REQUIRED}[7600],${SECONDARY_IP?REQUIRED}[7600]"
      KEYCLOAK_CACHE_OWNERS_COUNT: 2
      KEYCLOAK_AUTH_CACHE_OWNERS_COUNT: 2
    ports:
      - "8080:8080"
      - "7600:7600"

  pg-1:
    extra_hosts:
      pg-0: ${PRIMARY_IP?REQUIRED}
      pg-1: ${SECONDARY_IP?REQUIRED}
    image: ${POSTGRES_IMAGE:-docker.io/bitnami/postgresql-repmgr}:${POSTGRES_IMAGE_VERSION:-11}
    ports:
      - 5432:5432
    environment:
      - POSTGRESQL_POSTGRES_PASSWORD=${POSTGRES_PASSWORD?REQUIRED}
      - POSTGRESQL_USERNAME=${KEYCLOAK_POSTGRES_USER:-keycloak}
      - POSTGRESQL_PASSWORD=${KEYCLOAK_POSTGRES_PASSWORD?REQUIRED}
      - POSTGRESQL_DATABASE=${KEYCLOAK_DATABASE:-keycloak}
      - REPMGR_PASSWORD=${REPMGR_PASSWORD?REQUIRED}
      - REPMGR_PRIMARY_HOST=${PRIMARY_IP?REQUIRED}
      - REPMGR_PRIMARY_PORT=5432
      - REPMGR_PARTNER_NODES=${PRIMARY_IP?REQUIRED}:5432,${SECONDARY_IP?REQUIRED}:${PORTBASE?REQUIRED}02
      - REPMGR_NODE_NAME=pl-1
      - REPMGR_NODE_NETWORK_NAME=${SECONDARY_IP?REQUIRED}
      - REPMGR_PORT_NUMBER=5432
    volumes:
      - "${CONTAINER_VOLUME?REQUIRED}/${SERIAL?REQUIRED}/postgres:/bitnami/postgresql:rw"
```

Usage

Start the primary database first. This way we can monitor the logs to ensure databases and users get created.

```
cd primary
docker-compose up -d pg-0 && dclf
```

Then we can start up the secondary db and make sure we see it connect to `pg-0` for replication.

```
cd secondary
docker-compose up -d pg-1 && docker-compose logs -f
```

If all is well, start the primary Keycloak.

```
docker-compose up -d && docker-compose logs -f
```

Followed by the secondary, using the same commands.

Check the logs to see that the cluster is operational. You should see messages similar to:

```
docker-compose logs | grep -i "cluster view"
```

```
keycloak-1_1  | 16:14:08,006 INFO  [org.infinispan.CLUSTER] (ServerService Thread Pool -- 59) ISPN000094: Received new cluster view for channel ejb: [925ff0da6d24|0] (1) [925ff0da6d24]
```

If you're not seeing a connection, check that the ports are open.

```
$ nmap -T4 192.168.13.100 -p5432,7600 -Pn

Starting Nmap 7.70 ( https://nmap.org ) at 2021-11-28 16:51 UTC
Nmap scan report for 192.168.1.100
Host is up (0.0011s latency).

PORT      STATE  SERVICE
5432/tcp  open   unknown
7600/tcp  open   unknown
```

Use `tcpdump` to see if you are getting traffic like this:

```
$ sudo tcpdump port 7600 -vvv -X

tcpdump: listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
16:49:14.744175 IP (tos 0x0, ttl 63, id 6648, offset 0, flags [DF], proto TCP (6), length 158)
    192.168.1.100.51851 > 192.168.1.128.7600: Flags [P.], cksum 0xfed1 (correct), seq 2670543495:2670543601, ack 4153511734, win 502, options [nop,nop,TS val 1943538146 ecr 3993260470], length 106
    0x0000:  4500 009e 19f8 4000 3f06 852d c0a8 0d64  E.....@.?..-...d
    0x0010:  c0a8 0d80 ca8b 1db0 9f2d 4287 f791 8f36  .........-B....6
    0x0020:  8018 01f6 fed1 0000 0101 080a 73d8 09e2  ............s...
    0x0030:  ee04 51b6 0000 0066 208b 0007 0203 1004  ..Q....f........
    0x0040:  c0a8 0d80 1db0 0236 d8b4 7d8f 1f48 f9c9  .......6..}..H..
    0x0050:  7416 5f0c 9fee bf00 0200 0900 3501 0100  t._.........5...
    0x0060:  0365 6a62 0000 3900 3c00 0365 6a62 0000  .ejb..9.<..ejb..
    0x0070:  002c 0102 36d8 b47d 8f1f 48f9 c974 165f  .,..6..}..H..t._
    0x0080:  0c9f eebf 0001 000c 6437 3563 3934 6330  ........d75c94c0
    0x0090:  6233 6536 1004 ac1b 0003 1db0 ffff       b3e6..........
16:49:14.744276 IP (tos 0x0, ttl 63, id 53291, offset 0, flags [DF], proto TCP (6), length 52)
    192.168.1.128.7600 > 192.168.1.100.51851: Flags [.], cksum 0x9c5b (incorrect -> 0x24a4), seq 1, ack 106, win 509, options [nop,nop,TS val 3993302788 ecr 1943538146], length 0
    0x0000:  4500 0034 d02b 4000 3f06 cf63 c0a8 0d80  E..4.+@.?..c....
    0x0010:  c0a8 0d64 1db0 ca8b f791 8f36 9f2d 42f1  ...d.......6.-B.
    0x0020:  8010 01fd 9c5b 0000 0101 080a ee04 f704  .....[..........
    0x0030:  73d8 09e2                                s...
```

## Theming

We use a custom theme on our login and account pages. With this one, I thought I'd do the same. However, this time I went much more simply with the deployment. Previously, I'd cloned the entire Keycloak theme folder. This time I found an article that helped me just add the parts I need, a few custom colours, a background and a logo.

[Keep Growing](https://keepgrowing.in/tools/keycloak-in-docker-3-how-to-customise-keycloak-themes/)

## References

[https://github.com/keycloak/keycloak/tree/main/examples/themes](https://github.com/keycloak/keycloak/tree/main/examples/themes)
