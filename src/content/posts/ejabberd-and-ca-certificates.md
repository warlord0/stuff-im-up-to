---
pubDatetime: 2021-01-23T19:25:40Z
modDatetime: 2021-01-24T12:04:30Z
title: "ejabberd and CA Certificates"
tags:
  - "Docker"
  - "ejabberd"
  - "Linux"
  - "xmpp"
description: "When running the ejabberd docker image in my container set I ran into a problem where I hit the rate limiter on Let's Encrypt. This meant I could switch to"
---
When running the ejabberd docker image in my container set I ran into a problem where I hit the rate limiter on Let's Encrypt. This meant I could switch to the staging ACME, which would mean untrusted CA certificate errors, or use a previously issued certificate set until my blockage was cleared.

Should be easy enough, all I have to do is comment out the `acme:` stanza and the `request_handlers:`, maybe just the `request_handler:` would do it.

```
  -
    port: 5280
    ip: \"::\"
    module: ejabberd_http
    request_handlers:
      "/admin": ejabberd_web_admin
      # "/.well-known/acme-challenge": ejabberd_acme
...
# acme:
#   contact: "mailto:nobody@domain.tld"
#   ca_url: https://acme-v02.api.letsencrypt.org/directory
#   # ca_url: https://acme-staging-v02.api.letsencrypt.org/directory
```

Then add in the location of the certs I'm using:

```
certfiles:
- /home/ejabberd/conf/certs/fullchain.pem
- /home/ejabberd/conf/certs/privkey.pem
```

Which are mounted using my `docker-compose.yml`

```
  ejabberd:
    depends_on: 
    - db
    - slapd
    healthcheck:
      test: [ "CMD", "bin/ejabberdctl", "status" ]
      interval: 1m
      timeout: 10s
      retries: 5
    hostname: ejabberd
    image: ejabberd/ecs:latest
    ports:
    - "5222:5222"
    - "5280:5280"
    - "5443:5443"
    - "5269:5269"
    volumes:
    - ./ejabberd/database:/home/ejabberd/database:rw
    - ./ejabberd/logs:/home/ejabberd/logs:rw
    - ./ejabberd/upload:/home/ejabberd/upload:rw
    - ./ejabberd/conf/ejabberd.yml:/home/ejabberd/conf/ejabberd.yml:rw
    - ./ejabberd/conf/certs:/home/ejabberd/conf/certs:rw
```

> When I started the service it complains that the certificate is signed by an untrusted CA!

These are Let's Encrypt certs and I know they are trusted, so why the error? Turns out the image `ejabberd/ecs:latest` doesn't come with any CA certificates. This means I have to add them. A quick proof of this by going into the container and add `ca-certificates` and restarting ejabberd:

```
docker-compose exec -u root ejabberd sh
apk add ca-certificates
exit
docker-compose exec ejabberd sh
bin/ejabberdctl restart
```

Now I can see the certificates load without error in the log.

Then I have to make the change permanent. This means I have to build my own container by creating my own `build/ejabbed/Dockerfile`.

```
FROM ejabberd/ecs:latest

USER root

RUN apk add ca-certificates

USER ejabberd
```

Change my `docker-compose.yml` from using an image to building the `Dockerfile`. By changing `image:` to `build:`

```
    # image: ejabberd/ecs:latest
    build: build/ejabberd
```

Then using:

```
docker-compose build
docker-compose up -d
```

Now I have a ejabberd container that has the CA certs required permanently.
