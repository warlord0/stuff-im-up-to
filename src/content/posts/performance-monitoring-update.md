---
pubDatetime: 2022-03-15T17:25:17Z
title: "Performance Monitoring Update"
tags:
  - "glances"
  - "grafana"
  - "influxdb"
  - "Linux"
heroImage: "/blog-media/2020/09/grafana-2.png"
description: "Previously, we used InfluxDB v1 - now we're rolling out InfluxDB v2.1. Building the Container Set We're going to use glances, influxdb and grafana. version"
---
Previously, we used [InfluxDB v1](https://warlord0blog.wordpress.com/2020/09/02/performance-monitoring/) - now we're rolling out InfluxDB v2.1.

## Building the Container Set

We're going to use glances, influxdb and grafana.

```
version: '3.2'

services:
  glances:
    hostname: static
    # image: ${GLANCES_IAME:-nicolargo/glances}:${GLANCES_IMAGE_VERSION:-latest}
    build: build/glances
    depends_on:
      - influxdb
    restart: always
    pid: host
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock:ro"
      - "${PWD}/glances/glances.conf:/glances/conf/glances.conf:ro"
      - "${PWD}/glances/glances.json:/glances/conf/glances.json:ro"
    environment:
      LOG_CFG: /glances/conf/glances.json
      GLANCES_OPT: -C /glances/conf/glances.conf -t 10 --export influxdb2 -d --quiet

  influxdb:
    image: ${INFLUXB_IMAGE:-influxdb}:${INFLUXB_IMAGE_VERSION:-latest}
    environment:
      DOCKER_INFLUXDB_INIT_USERNAME: ${DOCKER_INFLUXDB_INIT_USERNAME:-capacitor}
      DOCKER_INFLUXDB_INIT_PASSWORD: ${DOCKER_INFLUXDB_INIT_PASSWORD?REQUIRED}
      DOCKER_INFLUXDB_INIT_ORG: ${DOCKER_INFLUXDB_INIT_ORG:-org}
      DOCKER_INFLUXDB_INIT_BUCKET: ${DOCKER_INFLUXDB_INIT_BUCKET:-bucket}
      DOCKER_INFLUXDB_INIT_RETENTION: ${DOCKER_INFLUXDB_INIT_RETENTION:-1y}
      DOCKER_INFLUXDB_INIT_ADMIN_TOKEN: ${DOCKER_INFLUXDB_INIT_ADMIN_TOKEN?REQUIRED}
    volumes:
      - "${CONTAINER_VOLUMES?REQUIRED}/${SERIAL?REQUIRED}/influxdb:/var/lib/influxdb2"
    ports:
      - "${PORTBASE?REQUIRED}86:8086"

  grafana:
    image: ${GRAFANA_IMAGE:-grafana/grafana-oss}:${GRAFANA_IMAGE_VERSION:-latest}
    user: "104"
    volumes:
      - "${CONTAINER_VOLUMES?REQUIRED}/${SERIAL?REQUIRED}/grafana:/var/lib/grafana"
    ports:
      - "${PORTBASE?REQUIRED}00:3000"
    depends_on:
      - influxdb
```

Sample `.env` file for variables

```
SERIAL=S00458
CONTAINER_VOLUMES=/srv/container-volumes
PORTBASE=458

DOCKER_INFLUXDB_INIT_PASSWORD=SecretKey
DOCKER_INFLUXDB_INIT_ADMIN_TOKEN=SecretKey
DOCKER_INFLUXDB_INIT_ORG=myorg
DOCKER_INFLUXDB_INIT_BUCKET=glances
```

### Things I had to pay attention to:

Set the permissions on the container volumes path for grafana so that the user (104) could write to it, or none of my changes are persistent.

```
sudo chown 104:104 ${CONTAINER_VOLUMES?REQUIRED}/${SERIAL?REQUIRED}/grafana
sudo chmod ug+rwx ${CONTAINER_VOLUMES?REQUIRED}/${SERIAL?REQUIRED}/grafana
```

In the above, the italicised lines are optional for debug logging. I wanted to direct all log output to the console so docker would show me what was going on.

As docker gives it's container a random host name each time it starts, this would throw data into influxdb2 with the prefix of the hostname and that would be confusing when viewed in grafana. To prevent this, I specified a **static** hostname.

In my, `glances.conf` I have an influxdb2 section as below. To get the token, I had to go into the influxdb webgui at [https://myserver:45886](#) create the admin user and then Data \> API Tokens, and create a read/write token for the bucket `glances`.

```
[influxdb2]
# Configuration for the --export influxdb2 option
# https://influxdb.com/
host=influxdb
port=8086
protocol=http
org=myorg
bucket=glances
token=SecretKey
```

## Grafana

When configuring grafana you need to create a data source for influxdb, but choose flux as the query language. Once you change this, you can then use the token from above as part of the credentials lower on the page. Save and test the settings, and then we can import the dashboard.

The dashboard I used was from the resulting answer here: [https://github.com/nicolargo/glances/issues/1960](https://github.com/nicolargo/glances/issues/1960)

[https://github.com/nicolargo/glances/blob/develop/conf/glances-grafana-flux.json](https://github.com/nicolargo/glances/blob/develop/conf/glances-grafana-flux.json)

Hover on the + and chose import to paste in the JSON copied from the above link.
