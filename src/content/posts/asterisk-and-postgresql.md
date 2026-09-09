---
pubDatetime: 2020-04-12T13:46:50Z
modDatetime: 2020-04-15T20:32:01Z
title: "Asterisk and PostgreSQL"
tags:
  - "asterisk"
  - "Docker"
  - "Linux"
  - "postgresql"
description: "I started out wanting a real-time database connection to our existing LDAP server. This went well, but involved importing a schema into the LDAP cn=config"
---
I started out wanting a real-time database connection to our existing LDAP server. This went well, but involved importing a schema into the LDAP `cn=config` and mapping the data into Asterisk.

It then became apparent that the effort involved in linking Asterisk to LDAP didn't really produce the key result that I was after. My whole reason for linking Asterisk to LDAP was to share authentication credentials from our users for their SIP devices. After I'd deployed it I discovered that Asterisk would store it's credentials in different fields and what's worse is that the password could only be plain-text or an MD5 hash.

If our users must use a separate credential for logging into a SIP device, then using LDAP is no longer of interest to me. We may as well use a database - enter PostgreSQL.

Why PostgreSQL? We primarily build PostgreSQL databases for all of the cloud services we deliver, so sticking with what we know. The aim will be to replicate this configuration and look at bringing some high availability and redundancy into the system.

As I'm using the [Asterisk 17 Docker image](https://hub.docker.com/r/opusvl/asterisk). I reworked it and added in LDAP and now ODBC to handle our PostgreSQL requirements.

## ODBC

First you have to make sure you have a functional ODBC setup. I edited the configuration for `modules.conf` to enable the odbc resources.

#### ./etc/asterisk/modules.conf

```
; An example of loading ODBC support would be:
preload => res_odbc.so
preload => res_config_odbc.so
```

Make sure you don't have any `noload =>` statements that contradicts these later in the file, eg.

```
; Enable these if you want to configure Asterisk in a database
;noload => res_config_odbc.so
noload => res_config_pgsql.so
noload => res_config_ldap.so
noload => res_config_sqlite3.so
```

Setup the ODBC details in `res_odbc.conf`

#### ./etc/asterisk/res_odbc.conf

```
[asterisk]
enabled => yes
dsn => asterisk
username => asterisk
password => Obelix
pre-connect => yes
sanitysql => select 1
logging => yes
```

Configure the ODBC ini files. These are mounted into the docker image.

#### odbc.ini

```
[asterisk]
Driver = PostgreSQL
Description = PostgreSQL connection to ‘asterisk’ database
#Server = db
#Port = 5432
Database = asterisk
UserName = asterisk
Password = Obelix
Socket = /var/run/postgresql
```

#### odbcinst.ini

```
[PostgreSQL]
Description = ODBC for PostgreSQL
Driver = /usr/lib/x86_64-linux-gnu/odbc/psqlodbcw.so
Setup = /usr/lib/x86_64-linux-gnu/odbc/libodbcpsqlS.so
UsageCount = 2
```

#### docker-compose.yml

Note that I'm mounting the `.pgsocket` in both containers. This is how I'm talking to postgresql between containers using unix sockets. You could change this by specifying the host and port, which I have left commented out in the above odbc.ini.

```
version: '3'

services:
  asterisk:
    image: opusvl/asterisk:latest
    volumes:
      - "${PWD}/etc/asterisk/:/etc/asterisk:rw"
      - "${PWD}/log:/var/log/asterisk"
      - "${PWD}/odbc.ini:/etc/odbc.ini"
      - "${PWD}/odbcinst.ini:/etc/odbcinst.ini"
      - "${PWD}/.pgsocket:/var/run/postgresql"
    ports:
      - "5060:5060/tcp"
      - "5060:5060/udp"
      - "5038:5038"
      - "8088:8088"
      - "10000-11000:10000-11000/udp"
      - "1314"
    network_mode: "host"

  db:
    image: ${POSTGRES_IMAGE:-postgres}:${POSTGRES_IMAGE_VERSION:-12}
    environment:
      POSTGRES_DB:  "${POSTGRES_DB:-postgres}"
      POSTGRES_USER: "${POSTGRES_USER:-postgres}"
      POSTGRES_PASSWORD: "${POSTGRES_PASSWORD}"
    volumes:
      - "${PWD}/.pgdata:/var/lib/postgresql/data"
      - "${PWD}/.pgsocket:/var/run/postgresql"
      - "${PWD}/init.sql:/docker-entrypoint-initdb.d/init.sql:ro"
    ports:
      - "5432:5432"
    restart: always
```

## PostgreSQL Schema

This was quite a challenge. Asterisk comes with the tools to build the SQL schema using a migration tool called alembic.

> As I've already done this and it's part of the compose repository the sql is ready to go, but I thought it important to record how I achieved this.
>
> [https://github.com/OpusVL/asterisk-pgsql](https://github.com/OpusVL/asterisk-pgsql)

Instead of running alembic against a live DB I had it dump out the generated SQL and put it into the `init.sql` script. By mounting a `.sql` file into the folder `docker-entrypoint-initdb.d` it gets executed when there is no database and initialises everything for us.

I cloned the asterisk repo to a local folder and changed into the `contrib/ast-db-manage` folder.

```
$ git clone git@github.com:asterisk/asterisk.git
$ cd asterisk/contrib/ast-db-manage
```

Copy the `config.ini.example` file to `config.ini` and edit it so that the line for postgresql is enabled and mysql disabled (the user:pass is not relevant here so don't need changing):

```
sqlalchemy.url = postgresql://user:pass@localhost/asterisk
#sqlalchemy.url = mysql://user:pass@localhost/asterisk
```

Using alembic required me to install `pipenv` and some python scripts.

```
$ sudo apt install pipenv
$ pipenv install --three fastapi fastapi-sqlalchemy pydantic alembic psycopg2 uvicorn
$ pipenv shell
$ alembic -c config.ini upgrade head --sql > schema.sql
(CTRL-D)
```

This should have created a large `schema.sql` script. We need to paste that into an init script below. But you also need to take it out of a transaction by removing the lines `BEGIN;` and `COMMIT;` first.

#### init.sql

```
CREATE USER asterisk WITH ENCRYPTED PASSWORD 'Obelix' CREATEDB;

CREATE DATABASE asterisk OWNER=asterisk;

\c asterisk;

-- 8< ---- INSERTED SQL HERE

GRANT ALL ON ALL TABLES IN SCHEMA public TO asterisk;
```

## Start Asterisk and PostgreSQL

```
$ docker-compose up -d
```

Get to the asterisk console and let's see how things are.

```
$ docker-compose exec asterisk asterisk -grcvvvvvvvvvvv  
                                                               
Asterisk GIT-master-7a04947abd, Copyright (C) 1999 - 2018, Digium, Inc. and others.
Created by Mark Spencer <markster@digium.com>
Asterisk comes with ABSOLUTELY NO WARRANTY; type 'core show warranty' for details.
This is free software, with components licensed under the GNU General Public
License version 2 and other licenses; you are welcome to redistribute it under
certain conditions. Type 'core show license' for details.
=========================================================================
Connected to Asterisk GIT-master-7a04947abd currently running on detective (pid = 10)
detective*CLI> odbc show 

ODBC DSN Settings
-----------------

  Name:   asterisk
  DSN:    asterisk
    Number of active connections: 1 (out of 1)
    Logging: Enabled
    Number of prepares executed: 227
    Number of queries executed: 227
    Longest running SQL query: SELECT * FROM ps_endpoints WHERE id = ? (2 milliseconds)
```

It's alive!

Next step is to add some data into the tables so we can start using Asterisk live.

## References

[https://github.com/OpusVL/asterisk-pgsql](https://github.com/OpusVL/asterisk-pgsql)

[https://wiki.asterisk.org/wiki/display/AST/Setting+up+PJSIP+Realtime](https://wiki.asterisk.org/wiki/display/AST/Setting+up+PJSIP+Realtime)

[https://github.com/OpusVL/asterisk-pgsql](https://github.com/OpusVL/asterisk-pgsql)
