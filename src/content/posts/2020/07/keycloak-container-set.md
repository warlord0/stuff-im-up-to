---
pubDatetime: 2020-07-22T19:27:04Z
modDatetime: 2023-04-21T17:49:28Z
title: "Keycloak Container Set"
tags:
  - "authentication"
  - "keycloak"
  - "Linux"
  - "oauth2"
  - "Security"
  - "single-sign-on"
  - "Web"
heroImage: "/blog-media/2020/07/keycloak.png"
description: "Single Sign On from a simple docker container set. The container might be simple but the complexities of OAuth2, SAML and identity services are far from st"
---
Single Sign On from a simple docker container set.

The container might be simple but the complexities of OAuth2, SAML and identity services are far from straight forward. For some time we've been using applications that can provide OAuth2 services as authenticators. This needed to change as we were looking to broaden the capabilities of our authentication processes to encompass 3rd parties and various authentication realms - from trusted, untrusted and community sources.

Like many things keycloak starts out as foreign and unwieldy unless you really have a handle on authentication protocols. But getting a keycloak service up and running inside docker isn't difficult.

#### docker-compose.yml

```
version: '3.2'

services:
  keycloak:
    image: quay.io/keycloak/keycloak:10.0.2
    environment:
      KEYCLOAK_USER: ${KEYCLOAK_USER:-admin}
      KEYCLOAK_PASSWORD: ${KEYCLOAK_PASSWORD?REQUIRED}
      KEYCLOAK_LOGLEVEL: DEBUG
      DB_ADDR: db
      DB_VENDOR: postgres
      DB_DATABASE: ${KEYCLOAK_DATABASE:-keycloak}
      DB_USER: ${KEYCLOAK_POSTGRES_USER:-keycloak}
      DB_PASSWORD: ${KEYCLOAK_POSTGRES_PASSWORD:-keycloak}
    ports:
      - "8080:8080"

  db:
    image: ${POSTGRES_IMAGE:-postgres}:${POSTGRES_IMAGE_VERSION:-12}
    environment:
      POSTGRES_DB:  "${POSTGRES_DB:-postgres}"
      POSTGRES_USER: "${POSTGRES_USER:-postgres}"
      POSTGRES_PASSWORD: "${POSTGRES_PASSWORD?REQUIRED}"
      KEYCLOAK_DATABASE: ${KEYCLOAK_DATABASE:-keycloak}
      KEYCLOAK_POSTGRES_USER: ${KEYCLOAK_POSTGRES_USER:-keycloak}
      KEYCLOAK_POSTGRES_PASSWORD: ${KEYCLOAK_POSTGRES_PASSWORD:-keycloak}
    volumes:
    - "${PWD}/postgres:/var/lib/postgresql/data"
    - "${PWD}/pg_socket:/var/run/postgresql"
    - "${PWD}/initdb.sql:/docker-entrypoint-initdb.d/initdb.sql:ro"
    restart: always
```

#### .env

```
POSTGRES_PASSWORD=SecretKey

KEYCLOAK_USER=admin
KEYCLOAK_PASSWORD=SuperSecretKey
```

#### initdb.sql

```
create user keycloak with encrypted password 'SuperSecretKey';
create database keycloak with owner keycloak;
```

Start up the container set:

```
docker-compose up -d
```

Visit the admin page and login with the password you specified in the `.env`.

[http://localhost:8080](#)

Now the real learning begins - with a working service you can now browse the settings, attach it to your LDAP and configure clients to authenticate against it.

What makes this exciting for me is the ability to give the users a real easy way of changing their LDAP password with mechanisms to verify email addresses and simple forms. Even control two-factor authentication using One Time Passwords taking the weight off the sysadmins.

**For reverse proxy setup see [Keycloak and OpenLDAP](https://warlord0blog.wordpress.com/2020/07/24/keycloak-and-openldap/)**
