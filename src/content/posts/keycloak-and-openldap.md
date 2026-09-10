---
pubDatetime: 2020-07-24T17:39:48Z
modDatetime: 2021-11-30T09:06:54Z
title: "Keycloak and OpenLDAP"
tags:
  - "authentication"
  - "keycloak"
  - "Linux"
  - "nginx"
  - "oauth2"
  - "Security"
  - "single-sign-on"
heroImage: "/blog-media/2020/07/keycloak.png"
description: "After getting Keycloak up and running, it's a breeze to connect it to LDAP and use the users from there, but there were a few things I missed about group m"
---
After getting Keycloak up and running, it's a breeze to connect it to LDAP and use the users from there, but there were a few things I missed about group membership and there's a fun quirk to fix about the user name.

## Synchronising Users

First task after creating a new realm is to go to User Federation and add an LDAP provider. Fill in all you details for the LDAP server - I'd advise you to use an account that has writeable access to your people OU at least. This is so you can leave Keycloak to manage your users and let them have a self-service portal for changing their passwords.

Ensure you don't miss the "Search Scope" option and set it to subtree if you want a recursive search. Then choose to sync your LDAP accounts on a periodic basis both for full and changed users.

Save your changes and then you can chose manually Syncrhonise all your users, right now. You'll see them immediately under the User menu.

The Mappers tab - is where the magic happens. Seems strange, but this is how we get to our LDAP groups. We'll synchronise them too, but fix your user names first.

It seems that out of the box Keycloak gets the users first name from the `cn` attribute - I don't know why it uses that. You need to go change it to `givenName` to make things right.

Click on `first-name` and change the attribute from `cn` to `givenName`.

## LDAP Group to Keycloak Groups

We want to import all of our LDAP groups into Keycloak.

Click on Create to create a mapper and call it `ldap-groups`. Set the LDAP Groups DN to the DN where your groups are, eg. `ou=groups,dc=domain,dc=tld`. In our setup we use the objectClass `groupOfUniqueNames` for our groups and `uniqueMember` for the membership attribute. No other changes needed, save the mapper and you can synchronise the groups to Keycloak.

## Reverse Proxy

This should be documented more clearly, because I struggled with it when I shouldn't have. It's also the result of a lot of forum posts and searches. The basis of the setup is tell keycloak it is behind a proxy and tell the proxy to add headers to tell keycloak what the front end is doing.

### Keycloak

In the container service for keycloak set the environment variable `PROXY_ADDRESS_FORWARDING`, eg.

```
version: '3.2'

services:
  keycloak:
    image: ${KEYCLOAK_IMAGE:-quay.io/keycloak/keycloak}:${KEYCLOAK_IMAGE_VERSION:-10.0.2}
    environment:
      KEYCLOAK_USER: ${KEYCLOAK_USER:-admin}
      KEYCLOAK_PASSWORD: ${KEYCLOAK_PASSWORD?REQUIRED}
      KEYCLOAK_LOGLEVEL: ${KEYCLOAK_LOGLEVEL:-INFO}
      DB_ADDR: db
      DB_VENDOR: postgres
      DB_DATABASE: ${KEYCLOAK_DATABASE?REQUIRED}
      DB_USER: ${KEYCLOAK_POSTGRES_USER?REQUIRED}
      DB_PASSWORD: ${KEYCLOAK_POSTGRES_PASSWORD?REQUIRED}
      PROXY_ADDRESS_FORWARDING: ${PROXY_ADDRESS_FORWARDING:-true}
    ports:
      - "8080:8080"
```

The default option for me here is set to true. This way I don't need it in my `.env` file.

I did **NOT** set any front end in either the config or in the admin console for any realm - even the master. There was no need. As soon as I clicked on the 'OpenID Endpoint Configuration' link on the realms General tab the urls for everything were correct.

### Nginx

Set the proxy-headers in the `location / {}` section of your config:

```
upstream keycloak-sso {
    server 192.168.0.24:8080 weight=1 fail_timeout=30s;
}

server {
    ...
    location / {
        # set headers
        proxy_buffer_size                  128k;
        proxy_buffers                      4 256k;
        proxy_busy_buffers_size            256k;
        proxy_set_header Referer           $http_referer;
        proxy_set_header X-Real-IP         $remote_addr;
        proxy_set_header X-Forwarded-Host  $host;
        proxy_set_header X-Forwarded-For   $proxy_add_x_forwarded_for;
        proxy_set_header X-Server-Select   $scheme;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-Port  $server_port;
        proxy_set_header X-Url-Scheme:     $scheme;
        proxy_set_header Cookie            $http_cookie;
        proxy_set_header Host              $host;
        proxy_http_version                 1.1;
        proxy_set_header Upgrade           $http_upgrade;
        proxy_set_header Connection        ‘upgrade’;

        proxy_pass http://keycloak-sso;
        # by default, do not forward anything
        proxy_redirect off;
    } 
}
```

This is my belt and braces config. It passes lots of stuff to the back-end, the important parts being Proto, Port and Host. If I missed any other important ones - the config above works.

## Error Message

Just before things started to get used in anger an error in my Nginx `error.log` triggered a 502 and I couldn't login.

```
upstream sent too big header while reading response header from upstream
```

This is because the cookies sent by keycloak are pretty big and need more buffer space. The above Nginx config takes care of that with buffer sizes.
