---
pubDatetime: 2023-09-21T20:51:25Z
modDatetime: 2023-09-21T20:52:18Z
title: "PostgreSQL, SCRAM and TLS"
tags:
  - "Linux"
  - "postgresql"
  - "Security"
heroImage: "/blog-media/2018/02/best-postgresql-hosting.png"
description: "When setting up a server using v10.1 and trying to connect using psql client v14, I got an error: PGPASSWORD=SecretKey PGSSLMODE=require psql --host 172.16"
---
When setting up a server using v10.1 and trying to connect using `psql` client v14, I got an error:

```
PGPASSWORD=SecretKey PGSSLMODE=require psql --host 172.16.10.110 --port 54732 -U myuser -d mydb

psql: error: connection to server at "172.16.10.110", port 5432 failed: FATAL:  unexpected SCRAM channel-binding attribute in client-final-message
```

I have my postgresql.conf setup to expect scram-sha-25 and ssl:

#### postgresql.conf

```
ssl = on
ssl_cert_file = 'server.crt'
ssl_key_file = 'server.key'
password_encryption = scram-sha-256
```

My `pg_hbaa.conf` requires ssl.

#### pg_hba.conf

```
hostssl all mydb 172.16.10.123/32 scram-sha-256
```

I used a self-signed cert generated using:

```
openssl req -x509 -newkey rsa:4096 -keyout server.key -out server.crt -days 3650 -nodes
```

My application connects just fine, but I missed the how-to setup a `psql` connection to disable channel binding. It needs to be passed in as part of the `-d` parameter, eg.

```
$ PGPASSWORD=SecretKey psql --host 172.16.8.110 --port 5432 -U myuser -d "sslmode=require dbname=mydb channel_binding=disable ssl_min_protocol_version=TLSv1.2"
```
