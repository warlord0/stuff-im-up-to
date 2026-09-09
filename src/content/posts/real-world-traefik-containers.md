---
pubDatetime: 2021-03-18T17:29:29Z
title: "Real World Traefik Containers"
draft: true
tags:
  - "Uncategorized"
description: "After starting out with Traefik Swarm and portainer I started looking to migrate a typical business container set into it. The application service has a fe"
---
After starting out with [Traefik Swarm](https://warlord0blog.wordpress.com/2021/03/17/traefik-swarm/) and [portainer](https://warlord0blog.wordpress.com/2021/03/14/docker-swarm/) I started looking to migrate a typical business container set into it. The application service has a few challenges that require sticky sessions if you want to operate on a cluster. It also requires multiple services within a container. It must be protected by TLS certificates and sit behind a load balancer to cope with front end and back end failures.

The application service is [Odoo ERP](https://www.odoo.com) which we use extensively. But should provide enough guidance to help with other such applications that you want to cluster.

Let's get traefik configured and running with all the options we need for an application build. You might decide to do things a bit differently if you want to use and external config file. This is just he way to do it to get started from a simple base.

#### traefik/docker-compose.yml

```
networks:
  odoo:
    external: true
    name: odoo
services:
  reverse-proxy:
    command:
    - --api.insecure=true
    - --providers.docker
    - --providers.docker.swarmMode=true
    - --accesslog=true
    - --log.level=DEBUG
    - --log.format=json
    - --providers.docker.exposedbydefault=false
    - --entryPoints.web.address=:80
    - --entrypoints.websecure.address=:443
    - --certificatesresolvers.acmeresolver.acme.email=paul.bargewell@whalesanctuary.co.uk
    - --certificatesresolvers.acmeresolver.acme.httpchallenge.entrypoint=web
    - --certificatesresolvers.acmeresolver.acme.storage=/etc/traefik/acme/acme.json
    - --certificatesresolvers.acmeresolver.acme.caserver=https://acme-staging-v02.api.letsencrypt.org/directory
    deploy:
      labels:
        traefik.enable: "True"
      placement:
        constraints:
        - node.role == manager
      replicas: 1
      update_config:
        delay: 15s
        order: start-first
        parallelism: 1
    image: traefik:v2.4
    networks:
      odoo: null
    ports:
    - protocol: tcp
      published: 443
      target: 443
    - protocol: tcp
      published: 80
      target: 80
    - mode: host
      published: 8080
      target: 8080
    volumes:
    - /var/run/docker.sock:/var/run/docker.sock:rw
    - traefik:/etc/traefik/acme:rw
version: '3.7'
volumes:
  traefik:
    driver: local
    driver_opts:
      device: :/srv/nfs-volumes/traefik
      o: addr=192.168.122.106,rw,noatime,rsize=8192,wsize=8192,tcp,timeo=14
      type: nfs4
```

There's plenty you'll need to check before beploying this file to the stack.
