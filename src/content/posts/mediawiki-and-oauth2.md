---
pubDatetime: 2020-07-21T16:22:20Z
modDatetime: 2021-01-13T21:32:45Z
title: "MediaWiki and OAuth2"
tags:
  - "authentication"
  - "Linux"
  - "oauth2"
  - "php"
  - "Security"
  - "single-sign-on"
  - "Web"
heroImage: "/blog-media/2020/07/mediawiki_logo.png"
description: "With a move to a more joined up authentication using Single Sign On (SSO) I deployed a Keycloak service in a docker container - that should probably form p"
---
With a move to a more joined up authentication using Single Sign On (SSO) I deployed a Keycloak service in a docker container - that should probably form part of a later article.

Keycloak provides the bridge between OAuth2/SAML and LDAP authentication. Rather than relying on the same passwords and having to type the same credentials time and again, into various corporate applications, we can now setup the application with a client in keycloak and use tokens across authentication our landscape.

As we use MediaWiki for the bulk of our corporate knowledge it made sense to add in Single Sign On.

Building the MediaWiki docker image required a tweak to allow us to incorporate ImageMagick. I wanted this so I could include SVG image files into the system. Makes things much nicer if we're holding vector images for many of our diagrams.

I also needed to pull in the [OAuth2 Client extension](https://www.mediawiki.org/wiki/Extension:OAuth2_Client), and that needed git and unzip to handle that. It may become more elegant later, but this process works.

> The extension is "unstable" at this point and needs some fettling.

Because I'm using the Bitnami docker image I had to use a `docker-compose.yml` that builds the image with the extras I want. You'll notice I'm big on environment variables and most of the config comes from a `.env` file.

#### docker-compose.yml

```
version: '3.2'
services:
  db:
    image: ${MARIADB_IMAGE:-docker.io/bitnami/mariadb}:${MARIADB_IMAGE_VERSION:-10.3-debian-10}
    environment:
      MARIADB_USER: ${MARIADB_USER:-wikiuser}
      MARIADB_PASSWORD: ${MARIADB_PASSWORD?REQUIRED}
      MARIADB_DATABASE: ${MARIADB_DATABASE:-mediawiki}
      MARIADB_ROOT_PASSWORD: ${MARIADB_ROOT_PASSWORD?REQUIRED}
    volumes:
      - '${PWD}/mysql:/bitnami'
      - '${PWD}/socket:/opt/bitnami/mariadb/tmp/'
    restart: on-failure
  mediawiki:
    build: ${PWD}/build
    environment:
      MEDIAWIKI_DATABASE_HOST: ${MEDIAWIKI_DATABASE_HOST:-db}
      MEDIAWIKI_DATABASE_PORT_NUMBER: ${MEDIAWIKI_DATABASE_PORT_NUMBER:-3306}
      MEDIAWIKI_DATABASE_NAME: ${MARIADB_DATABASE:-mediawiki}
      MEDIAWIKI_DATABASE_USER: ${MARIADB_USER:-wikiuser}
      MEDIAWIKI_DATABASE_PASSWORD: ${MARIADB_PASSWORD?REQUIRED}
      MEDIAWIKI_WIKI_NAME: ${MEDIAWIKI_WIKI_NAME:-Wiki}
      MEDIAWIKI_USERNAME: ${MEDIAWIKI_USERNAME:-user}
      MEDIAWIKI_PASSWORD: ${MEDIAWIKI_PASSWORD:-bitnami123}
      MEDIAWIKI_EMAIL: ${MEDIAWIKI_EMAIL:-user@example.com}
    ports:
      - '8080:8080'
    volumes:
      - '${PWD}/wiki:/bitnami'
      - '${PWD}/socket:/opt/bitnami/mysql/tmp'
    depends_on:
      - db
    restart: on-failure
```

#### build/Dockerfile

```
FROM ${MEDIAWIKI_IMAGE:-docker.io/bitnami/mediawiki}:${MEDIAWIKI_IMAGE_VERSION:-1-debian-10}

USER root

RUN install_packages imagemagick librsvg2-bin git unzip

USER 1001

RUN cd /opt/bitnami/mediawiki/extensions && \
  git clone https://github.com/Schine/MW-OAuth2Client.git && \
  cd MW-OAuth2Client && \
  git submodule update --init && \
  cd vendors/oauth2-client && \
  composer install
```

Before running it do a build, a pull and then bring it up:

```
docker-compose build && \
docker-compose pull && \
docker-compose up -d
```

This will create the database and add a default user in based on your `MEDIAWIKI_USERNAME` and `MEDIAWKI_PASSWORD` `.env` settings.

At this stage it won't have the completed OAuth2 setup as we need to add in a `CustomSettings.php` file that contains all the additions we need.

#### CustomSettings.php

```
<?php

wfLoadExtension( 'MW-OAuth2Client' );

# Private Wiki
$wgGroupPermissions['*']['createaccount'] = false;
$wgGroupPermissions['*']['edit'] = false;
$wgGroupPermissions['*']['read'] = false;

$wgServer = WebRequest::detectServer();

## use ImageMagick in mediawiki
$wgUseImageResize = true;
$wgUseImageMagick = true;
$wgImageMagickConvertCommand = "/usr/bin/convert";

# For SVG image support
$wgAllowTitlesInSVG = true;
$wgSVGConverter = 'ImageMagick';
$wgSVGConverters = array(
  'ImageMagick' => '"/usr/bin/convert" -background white -geometry $width $input $output',
);

# OAuth2 Settings - you get these from Keycloak when you configure a client

$wgOAuth2Client['client']['id']     = 'mediawiki'; // The client ID assigned to you by the provider
$wgOAuth2Client['client']['secret'] = 'a82f261d-0557-4741-959d-4d649566b4b8'; // The client secret assigned from keycloak

$wgOAuth2Client['configuration']['authorize_endpoint']     = 'https://keycloakserver:443/auth/realms/myrealm/protocol/openid-connect/auth'; // Authorization URL
$wgOAuth2Client['configuration']['access_token_endpoint']  = 'https://keycloakserver:443/auth/realms/myrealm/protocol/openid-connect/token'; // Token URL
$wgOAuth2Client['configuration']['api_endpoint']           = 'https://keycloakserver:443/auth/realms/myrealm/protocol/openid-connect/userinfo'; // URL to fetch user JSON
$wgOAuth2Client['configuration']['redirect_uri']           = 'https://mediawikiserver:443/wiki/Special:OAuth2Client/callback'; // URL for OAuth2 server to redirect to

$wgOAuth2Client['configuration']['username'] = 'preferred_username'; // JSON path to username
$wgOAuth2Client['configuration']['email'] = 'email'; // JSON path to email

$wgOAuth2Client['configuration']['scopes'] = 'openid email profile'; //Permissions

$wgOAuth2Client['configuration']['service_name'] = 'Keycloak'; // the name of your service
$wgOAuth2Client['configuration']['service_login_link_text'] = 'Login from Keycloak'; // the text of the login link

// To support private wikis, you need to whitelist the special pages the extension adds in "LocalSettings.php": 
$wgWhitelistRead = ['Special:OAuth2Client', 'Special:OAuth2Client/redirect', 'Special:OAuth2Client/callback'];

$wgObjectCacheSessionExpiry = 86400;
```

Copy the `CustomSetting.php` file into `wiki/mediawiki` and restart the container set.

## We're Not Logging In

After I setup the client in the Keycloak admin panel for our realm I could see that the user logged in successfully, but according to MediaWiki there was a failure in processing the returned information. After turning on debugging it reported a problem at line \#165 of `SpecialOAuth2Client.php` - time for a trawl through github.

I found this: [https://github.com/Schine/MW-OAuth2Client/pull/17](https://github.com/Schine/MW-OAuth2Client/pull/17)

It's not committed into the master branch yet. I edited the file manually and made the changes listed. Refreshed the login and in I go! Logged in, user created and ready to go.

```
sudo vi wiki/mediawiki/extensions/MW-OAuth2Client/SpecialOAuth2Client.php 
```

The danger with this is that when I rebuild the container set this change will get overwritten. Hopefully the pull request will get accepted soon, it's only 11 days old at this point.

> This change got merged in to master so no more need for a manual edit of the file.

## MediaWiki Debugging

Add the following into the top of the `CustomSettings.php` file and restart the container set.

```
error_reporting( -1 );
ini_set( 'display_errors', 1 );

$wgShowExceptionDetails = true;
$wgDebugToolbar = true;
$wgShowDebug = true;
$wgDevelopmentWarnings = true;
```

Comment them out with `//` when you're done so you can easily fire them back up as necessary.
