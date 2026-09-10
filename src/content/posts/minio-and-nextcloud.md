---
pubDatetime: 2021-05-04T16:09:35Z
modDatetime: 2021-05-04T16:10:48Z
title: "Minio and Nextcloud"
tags:
  - "Docker"
  - "Linux"
  - "nextcloud"
  - "s3"
heroImage: "/blog-media/2021/05/minio_logo.png"
description: "As a follower of Open Source it's time to look at a storage platform that offers an S3 service like Amazon. Minio offers us a storage platform that we can"
---
As a follower of Open Source it's time to look at a storage platform that offers an S3 service like Amazon. [Minio](https://min.io) offers us a storage platform that we can use in house and reduce our exposure to relying on the cloud giants for storing our data.

Nextcloud already comes with all the goodies to store files remotely. Te only thing we need to do is tell it to use S3 and how to access it.

When you setup Minio you end up with a pretty simple web object store. What we need to use to access it is an access key and a secret. When I built the Minio container set I provided those in my `.env` file and we use the same credentials for the config in Nextcloud.

To make life easier both minio and nextcloud container sets are on the same host. This means I can create a docker network called storage and have them talk to each other using their short host name, eg. minio. But it's no big deal to use them on separate hosts as all the traffic is plain old http.

```
docker network create storage
```

#### Minio docker-compose.yml

```
version: '3.2'

networks:
  default:
    external:
      name: storage

services:
  minio:
    image: ${MINIO_IMAGE:-minio/minio}:${MINIO_IMAGE_VERSION:-latest}
    environment: 
      MINIO_ACCESS_KEY: ${MINIO_ACCESS_KEY?REQUIRED}
      MINIO_SECRET_KEY: ${MINIO_SECRET_KEY?REQUIRED}
    volumes:
      - "${CONTAINER_VOLUME?REQUIRED}/${SERIAL?REQUIRED}/minio:${MINIO_PATH:-/data}"
      - "${PWD}/certs:/root/.minio/certs"
    healthcheck:
      test: [ "CMD", "curl", "http://localhost:9000/minio/health/live" ]    
      timeout: 60s
      interval: 10s
      retries: 6        
    ports:
      - "${PORTBASE?REQUIRED}90:9000"
    command: server ${MINIO_PATH:-/data}
    restart: unless-stopped
```

I don't need any reference to minio in the nextcloud container set, but I do need to use the same network `storage`.

The Nextcloud config is handled within the `config.php` that is under our `/srv/container-volumes` base path. We just edit this and include at the bottom the following entries:

```
  'objectstore' => 
  array (
    'class' => 'OC\\Files\\ObjectStore\\S3',
    'arguments' => 
    array (
      'bucket' => 'nextcloud',
      'autocreate' => false,
      'key' => 'SecretKey',
      'secret' => 'SuperSecretKey',
      'hostname' => 'minio',
      'port' => 9000,
      'use_ssl' => false,
      'use_path_style' => true,
    ),
  ),
```

This points Nextcloud to the internal address [`http://minio:9000`](#) for our S3 store and places it in a bucket called `nextcloud`. Then when we restart the Nextcloud container all our storage will be hosted by Minio.

> **Beware**: Setting the primary storage like this should be done at the point of initial configuration. No existing files will be moved. All existing files will effectively disappear. Get this done early!
