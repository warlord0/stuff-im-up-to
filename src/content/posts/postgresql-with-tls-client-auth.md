---
pubDatetime: 2023-09-26T17:39:04Z
modDatetime: 2023-09-26T17:54:46Z
title: "PostgreSQL with TLS Client Auth"
tags:
  - "postgresql"
  - "Security"
heroImage: "/blog-media/2018/02/best-postgresql-hosting.png"
description: "Configure postgresql.conf to enable ssl and configure a server key and certificate. Server Certificate Create a self-signed certificate pair. Put them in ."
---
Configure `postgresql.conf` to enable `ssl` and configure a server key and certificate.

## Server Certificate[](https://smartlimited.sharepoint.com/sites/SmartIT-Midlands/SitePages/PostgreSQL-with-TLS-Client-Auth.aspx#server-certificate)

Create a self-signed certificate pair. Put them in `./tls`

```
openssl req -new -x509 -days 3650 -nodes -text -out server.crt -keyout server.key -subj “/CN=server” 
```

## Client Certificates

```
openssl req -new -x509 -days 3650 -nodes -text -out client.crt -keyout client.key -subj “/CN=client”
```

#### postgresql.conf

```
ssl = on
ssl_key_file = '/tls/server.key'
ssl_cert_file = ‘/tls/server.crt’
```

We want to use self-signed client certificates that get verified. Put copies of each client certificate (NOT key) into the `ca.crt` file, eg.

```
cat client.crt >> tls/ca.crt
```

Add to postgresql.conf

```
ssl_ca_file = ‘/tls/ca.crt’
```

#### pg_hba.conf

This will require every connection to require a client certificate.

```
hostssl all all all cert
```

## docker-compose.yml[](https://smartlimited.sharepoint.com/sites/SmartIT-Midlands/SitePages/PostgreSQL-with-TLS-Client-Auth.aspx#docker-compose.yml)

This will mount the \`./tls\` folder into the image.

```
version: '3.7'

services:
  db:
    build: build/postgres
    environment:
      LANG: 'en_GB.UTF-8'
      LANGUAGE: 'en_GB.UTF-8'
      LC_ALL: 'en_GB.UTF-8'
      POSTGRES_DB: "${POSTGRES_DB:-postgres}"
      POSTGRES_PASSWORD: "${POSTGRES_PASSWORD?REQUIRED}"
      POSTGRES_USER: "${POSTGRES_USER:-postgres}"
    volumes:
      - "${CONTAINER_VOLUME?REQUIRED}/${SERIAL?REQUIRED}/postgres:/var/lib/postgresql/data:rw"
      - "${CONTAINER_VOLUME?REQUIRED}/${SERIAL?REQUIRED}/pg_socket:/var/run/postgresql:rw"
      - "${PWD}/tls:/tls:ro"
    restart: always
    ports:
      - "${PORTBASE?REQUIRED}32:5432"
```

### Locales[](https://smartlimited.sharepoint.com/sites/SmartIT-Midlands/SitePages/PostgreSQL-with-TLS-Client-Auth.aspx#locales)

Using `Dockerfile` to build with, we can specify the locale to use, in our case `en_GB.UTF-8`

```
FROM postgres:9.6
RUN localedef -i en_GB -c -f UTF-8 -A /usr/share/locale/locale.alias en_GB.UTF-8
ENV LANG en_GB.utf8
```

## Connecting with psql

```
PGSSLKEY=client.key PGSSLCERT=client.crt psql --host 127.0.0.1 --port 5432 -U client -d postgres
```

or

```
psql --host 127.0.0.1 --port 5432 -U client -d “sslkey=client.key sslcert=client.crt dbname=postgres”
```

## Evidence

```
select pg_ssl.pid, pg_ssl.ssl, pg_ssl.version,
           pg_sa.usename, pg_sa.client_addr
           from pg_stat_ssl pg_ssl
           join pg_stat_activity pg_sa
             on pg_ssl.pid = pg_sa.pid;

 pid | ssl | version | usename  | client_addr 
-----+-----+---------+----------+-------------
  63 | t   | TLSv1.2 | postgres | 172.23.0.1
(1 row)
```
