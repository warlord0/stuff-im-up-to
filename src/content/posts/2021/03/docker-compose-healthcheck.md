---
pubDatetime: 2021-03-04T11:51:34Z
modDatetime: 2021-03-04T12:04:14Z
title: "docker-compose healthcheck"
tags:
  - "Docker"
  - "Linux"
heroImage: "/blog-media/2020/01/moby-logo.png"
description: "Here I'm building a library of health checks used for various docker-compose containers. MySQL / MariaDB healthcheck: test: [ 'CMD', 'mysqladmin', 'ping',"
---
Here I'm building a library of health checks used for various docker-compose containers.

#### MySQL / MariaDB

```
    healthcheck:
      test: [ 'CMD', 'mysqladmin', 'ping', '-u', 'root', '-p${MYSQL_ROOT_PASSWORD?REQUIRED}' ]
      interval: 1m
      timeout: 10s
      retries: 5
```

#### redis

```
    healthcheck:
      test: [ 'CMD', 'redis-cli', 'ping' ]
      interval: 5m
      timeout: 10s
      retries: 5
```

#### PostgreSQL

`pg_isready` isn't really useful because often the service can be up, but the db isn't available.

```
    healthcheck:
      test: [ "CMD", "psql", "-U", "postgres", "-c", "SELECT 1;" ]
      interval: 1m
      timeout: 10s
      retries: 5
```

#### curl

Ensure you use `--fail` or your health check will always succeed.

```
    healthcheck: 
      test: [ "CMD", "curl", "--fail", "http://localhost" ]
      interval: "60s"
      timeout: "5s"
      retries: 3
```
