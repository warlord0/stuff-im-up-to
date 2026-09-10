---
pubDatetime: 2020-03-08T14:06:42Z
modDatetime: 2020-03-08T14:13:46Z
title: "PostgreSQL and Replication"
tags:
  - "Linux"
  - "postgresql"
heroImage: "/blog-media/2018/02/best-postgresql-hosting.png"
description: "We do a lot of postgres replication in our environment. Just about every docker postgres instance replicates its data over to a remote site for failover, s"
---
We do a lot of postgres replication in our environment. Just about every docker postgres instance replicates its data over to a remote site for failover, should the worst happen. But we don't tend to automate the process, maybe we should look at moving away from a manual failover.

Our docker production images are usually pulled using the official postgres image. But there are some other interesting images out there with features built in that could be quite useful. For this I've decided to try out PostDock and the image `postdock/postgres:latest-postgres11-repmgr40`. As you may be able to spot it includes `repmgr` which is an open source tool to manage failovers in postgres.

I found it very easy to setup, it's actually more complicated to figure out `repmgr` outside of using the ready made image.

I built a three node cluster, on three different hosts, and my docker-compose for each is pretty standard, so I used environment variables where the values are the same on each node.

### docker-compose.yml

```
version: '3'

services:
  db:
    image: postdock/postgres:latest-postgres11-repmgr40
    environment:
      POSTGRES_USER: ${POSTGRES_USER}
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
      POSTGRES_DB: ${POSTGRES_DB}
      REPLICATION_USER: ${REPLICATION_USER}
      REPLICATION_PASSWORD: ${REPLICATION_PASSWORD}
      REPLICATION_DB: ${REPLICATION_DB}
      REPLICATION_PRIMARY_HOST: ${REPLICATION_PRIMARY_HOST}
      NODE_ID: 1
      NODE_NAME: node1
      NODE_PRIORITY: 100
      CLUSTER_NAME: ${CLUSTER_NAME}
      CLUSTER_NODE_NETWORK_NAME: node1
      PARTNER_NODES: "node1,node2,node3"
      SSH_ENABLE: 1
      CONFIGS_DELIMITER_SYMBOL: ;
      CONFIGS: "listen_addresses:'*'"
    volumes:
      - "${PWD}/.pgdata/:/var/lib/postgresql/data:rw"
      - "${PWD}/.ssh/:/tmp/.ssh/"
    ports:
      - "5432:5432"
      - "2222:22"
```

The things to be mindful of are changing the `NODE_ID`, `NODE_NAME`, `NODE_PRIORITY` and `CLUSTER_NODE_NETWORK_NAME` on each node/host. On node1 I gave it a priority of 100, node2 95 and node3 90. In the event of a failure `repmgr` will work out who is next in line based on the priority.

The rest comes from the `.env` file:

### .env

```
POSTGRES_USER=postgres
POSTGRES_PASSWORD=MySuperSectretKey
POSTGRES_DB=postgres

REPLICATION_USER=replicator
REPLICATION_PASSWORD=MySecretKey
REPLICATION_DB=replication_db
REPLICATION_PRIMARY_HOST=node1

CLUSTER_NAME=pg_cluster
PARTNER_NODES="node1,node2,node3"
```

Because `repmgr` needs to talk to each ssh node I used port 2222 and must tell each node how to get to each other. For this I created a file `.ssh/config`.

```
Host *
  StrictHostKeyChecking no

Host node*
  Port 2222
```

Create an ssh keypair and copy it and the `config` to the `.ssh` folder on each host:

```
$ mkdir -p .ssh/keys
$ ssh-keygen -t rsa -b 4096 .ssh/keys/id_rsa
```

Then start your node1.

```
node1> $ docker-compose up -d
```

And repeat for nodes 2 and 3. This should then automatically deal with the WAL shipping and the hosts will all be kept in sync. It's that straight forward!

## Cluster Status

```
node1> $ docker-compose exec -u postgres db repmgr cluster show
```

```
 ID  | Name  | Role    | Status    | Upstream | Location | Connection string                                                                               
----+-------+---------+-----------+----------+----------+-------------------
 1  | node1 | primary | * running |          | default  | ...
 2  | node2 | standby |   running | node1    | default  | ...
 3  | node3 | standby |   running | node1    | default  | ...
```

## Primary Failure

With all the hosts running what happens if you fail the primary? The secondary automatically gets promoted and any hosts that were currently getting their WAL from node1 will be moved to the newly promoted master - node2. Why node2? Because of the `NODE_PRIORITY` setting.

```
node1> $ docker-compose down -v
```

```
node2> $ docker-compose exec -u postgres db repmgr cluster show
```

```
 ID  | Name  | Role    | Status    | Upstream | Location | Connection string                                                                               
----+-------+---------+-----------+----------+----------+--------------------------------------------------------------------------------------------------
 1  | node1 | primary | - failed  |          | default  | ...
 2  | node2 | primary | * running |          | default  | ...
 3  | node3 | standby |   running | node2    | default  | ...

WARNING: following issues were detected
  - when attempting to connect to node "node1" (ID: 1), following error encountered :
"could not connect to server: Connection refused
        Is the server running on host "node1" (192.168.122.86) and accepting
        TCP/IP connections on port 5432?"
```

## Primary Rejoins

A primary can't just rejoin. You never want to get into a split brain scenario where the data on the failed primary becomes a new primary when it's data is long out of date. So node1 can't just rejoin. `repmgr` wont let it happen and the node would just get shut down.

Let `repmgr` handle the rejoin by just deleting the failed primary data before restarting it. Then when you start node1 it becomes a slave.

```
node1> $ sudo rm -rf .pgdata
node1> $ docker-compose up -d && docker-compose log -f
```

```
db_1 | 2020-03-08 13:23:13.059 UTC [213] LOG: started streaming WAL from primary at 0/B000000 on timeline 4
...
db_1 | >>> Cloning is done
...
db_1 | [2020-03-08 13:23:42] [INFO] monitoring connection to upstream node "node2" (node ID: 2)
```

You'll see a few useful events in the log that show the WAL streaming process has started, WAL streaming cloning completed and that `repmgr` has rejoined the node to the cluster and is monitoring.

```
node1> $ docker-compose exec -u postgres db repmgr cluster show
```

```
 ID  | Name  | Role    | Status    | Upstream | Location | Connection string                                                                               
----+-------+---------+-----------+----------+----------+--------------------------------------------------------------------------------------------------
 1  | node1 | standby | * running | node2    | default  | ...
 2  | node2 | primary |   running |          | default  | ...
 3  | node3 | standby |   running | node2    | default  | ...
```

It's joined, but it's still not a primary. You'll see it's now getting its WAL from the upstream node2.

## Switching the Primary

If you want to manually promote a node to the primary, maybe you're doing maintenance or need to move back a to a failed primary you can use `repmgr` on the node you want to promote.

```
node1> $ docker-compose exec -u postgres db repmgr standby switchover --siblings-follow
```

This will tell all the other nodes to switch their WAL streaming to the new master once moved.
