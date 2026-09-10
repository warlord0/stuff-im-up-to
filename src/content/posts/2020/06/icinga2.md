---
pubDatetime: 2020-06-03T18:06:45Z
modDatetime: 2024-04-27T17:31:16Z
title: "Icinga2"
tags:
  - "Linux"
heroImage: "/blog-media/2020/06/icinga2_logo.png"
description: "Updated April 2024 Having had some experience with Nagios and writing Nagios plug-ins and using nagiosql3 to manage the configuration, the new job uses Ici"
---
***Updated April 2024***

Having had some experience with Nagios and writing Nagios plug-ins and using nagiosql3 to manage the configuration, the new job uses Icinga. I've had no exposure to it at all - until now.

Icinga2 uses Nagios as the monitoring engine, but where Nagios is a bit rough around the edges - Icinga2 smooths that all out. Icinga2 layers over it a nice web interface and a whole bunch of add-ons to add value to your monitoring and reporting.

I started by installing a local copy of Icinga2 v2.6.2 onto a virtual machine and encountered a few gotchas along the way. More because reading the docs is a lengthy process and I found you had to skip around the platforms specific stuff that didn't apply to the OS you're installing on. You also had to navigate several pages of different steps for web server, api and director.

My build is a Debian 10 Buster installation and I intended to just do an out of the box type of installation. That was until I encountered Apache2 and decided it would actually be easier just to go with what I know and use Nginx.

Taking for granted that you've built a server with internet access, a properly configured FQDN and have sshd configured, the following is the recipe I used in one follow from top down to deploy.

Add some prerequisites, add the apt key and repositories to your apt sources:

```
sudo apt-get -y install apt-transport-https wget curl gnupg
curl https://packages.icinga.com/icinga.key | sudo apt-key add -
```

I tried to use the installation directions for Debian on the website and got tied up with missing GPG keys.

```
W: GPG error: https://packages.icinga.com/debian icinga-bookworm InRelease: The following signatures couldn't be verified because the public key is not available: NO_PUBKEY C6E319C334410682
```

I removed the GPG keys it downloaded into `/usr/share/keyrings` and deleted reference to them from the apt list file. Then downloaded the missing key `C6E319C334410682` and dropped it into `/etc/apt/trusted.gpg.d/icinga.asc`

```
sudo wget https://keyserver.ubuntu.com/pks/lookup\?op=get\&search=0xc6e319c334410682 -O /etc/apt/trusted.gpg.d/icinga.asc

sudo chmod ugo+r /etc/apt/trusted.gpg.d/icinga.asc
```

#### /etc/apt/sources.d/icinga.list

```
deb https://packages.icinga.com/debian icinga-bookworm main
deb-src https://packages.icinga.com/debian icinga-bookworm main
```

```
sudo apt update
```

## Install icinga2

Install icinga2 and the plug-ins for monitoring things and start the service.

```
sudo apt -y install icinga2 icingacli monitoring-plugins
sudo systemctl enable --now icinga2
```

## Install icingaweb2

Now to install the web interface. Icinga requires it's own database and in this case I'm using mariadb. Include the IDO package for the required schema.

```
sudo apt -y install mariadb-server mariadb-client
```

Create the icinga database. If you're using mariadb too it has no root password and is used via `sudo`.

```
sudo mysql

CREATE DATABASE icinga;
GRANT SELECT, INSERT, UPDATE, DELETE, DROP, CREATE VIEW, INDEX, EXECUTE ON icinga.* TO 'icinga'@'localhost' IDENTIFIED BY 'icinga';
quit
```

This creates and `icinga` user with a password of `icinga` with access to the new `icinga` database. It can get confusing later on as more databases are required for different parts of icinga2.

Now create the schema and enable the feature using:

```
sudo apt -y install icinga2-ido-mysql
sudo mysql icinga < /usr/share/icinga2-ido-mysql/schema/mysql.sql
sudo icinga2 feature enable ido-mysql
sudo systemctl restart icinga2
```

## Install a Web Server (Nginx)

```
sudo apt -y install php-fpm nginx icingaweb2 php-gd php-imagick
sudo addgroup --system icingaweb2
sudo usermod -a -G icingaweb2 www-data
```

This will install php and Nginx to serve the icinga2web app from. IT also creates the `icingaweb2` user and add it to the `www-data` group.

I then managed to get a suggestion of what to add into the Nginx config using:

```
sudo icingacli setup config webserver nginx
```

After a few tweaks as I wanted to use the Unix socket instead of the TCP port my `/etc/nginx/sites-available/default` looks like this:

```
server {
    listen 80 default_server;
    listen [::]:80 default_server;

    root /usr/share/icingaweb2/public;

    # Add index.php to the list if you are using PHP
    index index.php;

    server_name _;

    location ~ ^/icingaweb2/index\.php(.*)$ {
        fastcgi_pass unix:/run/php/php-fpm.sock;
        #fastcgi_pass 127.0.0.1:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME /usr/share/icingaweb2/public/index.php;
        fastcgi_param ICINGAWEB_CONFIGDIR /etc/icingaweb2;
        fastcgi_param REMOTE_USER $remote_user;
    }

    location ~ ^/icingaweb2(.+)? {
        alias /usr/share/icingaweb2/public;
        index index.php;
        try_files $1 $uri $uri/ /icingaweb2/index.php$is_args$args;
    }

    location / {
        # First attempt to serve request as file, then
        # as directory, then fall back to displaying a 404.
        try_files $uri $uri/ =404;
    }

}
```

At this stage I'm not using SSL, so plain HTTP will do - until I'm happy with the build and then will add in HTTPS support. Also, this server isn't serving anything other than icinga.

**NOTE:** Pay attention to the `root` and the `fastcgi_pass`. Make allowances for you version of PHP. Unless there is a symlink to `/run/php/php-fpm.sock` to make it version agnostic.

Edit your `/etc/php/8.2/fpm/php.ini` and set the `date.timezone` variable, eg.

```
date.timezone = Europe/London
```

Restart php-fpm and Nginx

```
sudo systemctl restart php8.2-fpm.service
sudo systemctl restart nginx.service
```

## Web Setup

Create the icingaweb2 database:

```
sudo mysql

CREATE DATABASE icingaweb2;
GRANT ALL ON icingaweb2.* TO icingaweb2@localhost IDENTIFIED BY 'icingaweb2';
quit
```

### Setup the rest-api

This will generate certificates and configure the api. You must have setup the FQDN of your server for this. IF you haven't got a domain name things will start getting screwy from here, so this is why the official documentation recommends you use an FQDN, eg icinga-test.domain.tld

```
sudo icinga2 api setup

information/cli: Generating new CA.
information/base: Writing private key to '/var/lib/icinga2/ca//ca.key'.
information/base: Writing X509 certificate to '/var/lib/icinga2/ca//ca.crt'.
information/cli: Generating new CSR in '/var/lib/icinga2/certs//icinga-test.domain.tld.csr'.
information/base: Writing private key to '/var/lib/icinga2/certs//icinga-test.domain.tld.key'.
information/base: Writing certificate signing request to '/var/lib/icinga2/certs//icinga-test.domain.tld.csr'.
information/cli: Signing CSR with CA and writing certificate to '/var/lib/icinga2/certs//icinga-test.domain.tld.crt'.
information/pki: Writing certificate to file '/var/lib/icinga2/certs//icinga-test.domain.tld.crt'.
information/cli: Copying CA certificate to '/var/lib/icinga2/certs//ca.crt'.
information/cli: Adding new ApiUser 'root' in '/etc/icinga2/conf.d/api-users.conf'.
information/cli: Reading '/etc/icinga2/icinga2.conf'.
information/cli: Enabling the 'api' feature.
Enabling feature api. Make sure to restart Icinga 2 for these changes to take effect.
information/cli: Updating 'NodeName' constant in '/etc/icinga2/constants.conf'.
information/cli: Created backup file '/etc/icinga2/constants.conf.orig'.
information/cli: Updating 'ZoneName' constant in '/etc/icinga2/constants.conf'.
information/cli: Backup file '/etc/icinga2/constants.conf.orig' already exists. Skipping backup.
Done.
Now restart your Icinga 2 daemon to finish the installation!
```

Add an entry into the `/etc/icinga2/conf.d/api-users.conf` file with a suitably complex password:

```
object ApiUser "icingaweb2" {
  password = "f3842b5cf6891765d0f5d87b1dbebe"
  permissions = [ "status/query", "actions/*", "objects/modify/*", "objects/query/*" ]
}
```

```
sudo systemctl restart icinga2.service
```

We will need the ApiUser and password later in the web setup for "Command Transport".

We need to setup the web interface by creating a token we can copy from the command line and paste into the web setup.

```
sudo icingacli setup token create

The newly generated setup token is: 9222148252dc4aab
```

In case you missed it:

```
sudo icingacli setup token show
```

That should be it as far as getting things running. You should be able to visit the URL `http://server/icingaweb2/setup` to begin configuration of the UI.

Install Doc and Monitoring and click next.

You may see missing php modules for PDO PostgreSQL, this is to be expected as we're not using PostgreSQL in this instance. You should resolve any other issues highlighted in the process though.

For authentication at this stage I'm going to use Database - we will change to LDAP for production.

Database Resource - Now we fill in the details of our `icingaweb2` database, specifying the username and passwords we used above. It will warn you if you chose the wrong database when you validate the configuration. If when you click next it tries to create the database you should go back and ensure the password you specified was correct.

**Authentication Backend** - accept the default icingaweb2.

**Administration** - Choose a username and password for your administrative user.

**Application Configuration** - accept the defaults

**Monitoring Backend** - accept the defaults

**Monitoring IDO Resource** - fill in the details from your `icinga` database we created above.

***It was at this point things got a little tricky.***

I had to edit the file `/etc/icinga2/features-enabled/ido-mysql.conf` as I needed to have the correct user, password and database in there too.

```
/**
The db_ido_mysql library implements IDO functionality
for MySQL.
*/
library "db_ido_mysql"
  object IdoMysqlConnection "ido-mysql" {
  user = "icinga2",
  password = "icinga",
  host = "localhost",
  database = "icinga2"
}
```

Restart the icinga2 service.

```
sudo systemctl restart icinga2.service
```

Now you should be able to validate and continue the setup.

**Command Transport** - set the host to your systems FQDN and use the ApiUser details we added above - DO NOT user the `root` user.

**Monitoring Security** - accept the defaults.

**Congratulations! Icinga Web 2 has been successfully set up.**

At the end of this part of the setup you should be able to get to the url `http://server/icingaweb2` and login to discover you have a working installation that is monitoring nothing.

## Icinga2 Director

> Director, the bleeding edge configuration tool for Icinga 2

Director adds all the functionality to edit the configuration of monitored hosts and services from within the web interface - no more laborious editing of text files.

With the version I'm running I needed to ensure I had the following supporting modules installed.

[ipl \>=0.3.0](https://github.com/Icinga/icingaweb2-module-ipl)\
[incubator \>=0.5.0](https://github.com/Icinga/icingaweb2-module-incubator)\
[reactbundle \>-0.7.0](https://github.com/Icinga/icingaweb2-module-reactbundle)

My first mistakes where made by following instructions too literally with copy and paste. In order NOT to repeat my mistakes. Visit the githubs of each if the modules and find the version number in the branch drop down. Then replace the `MODULE_VERSION` with the one required, eg.

```
MODULE_NAME=ipl 
MODULE_VERSION=v0.5.0
REPO="https://github.com/Icinga/icingaweb2-module-${MODULE_NAME}" MODULES_PATH="/usr/share/icingaweb2/modules" 
sudo git clone ${REPO} "${MODULES_PATH}/${MODULE_NAME}" --branch "${MODULE_VERSION}" 
sudo icingacli module enable "${MODULE_NAME}"
```

```
MODULE_NAME=incubator
MODULE_VERSION=v0.7.0
REPO="https://github.com/Icinga/icingaweb2-module-${MODULE_NAME}"
MODULES_PATH="/usr/share/icingaweb2/modules"
sudo git clone ${REPO} "${MODULES_PATH}/${MODULE_NAME}" --branch "${MODULE_VERSION}"
sudo icingacli module enable "${MODULE_NAME}"
```

```
MODULE_NAME=reactbundle 
MODULE_VERSION=v0.7.0 REPO="https://github.com/Icinga/icingaweb2-module-${MODULE_NAME}" MODULES_PATH="/usr/share/icingaweb2/modules" sudo git clone ${REPO} "${MODULES_PATH}/${MODULE_NAME}" --branch "${MODULE_VERSION}" sudo icingacli module enable "${MODULE_NAME}"
```

If all went well these should be installed and ready for director.

```
$ sudo icingacli module list                                                                                                                             MODULE         VERSION   STATE     DESCRIPTION 
doc            2.7.3     enabled   Documentation module 
incubator      0.5.0     enabled   Incubator provides bleeding-edge libraries 
ipl            v0.5.0    enabled   The Icinga PHP library 
monitoring     2.7.3     enabled   Icinga monitoring module reactbundle    0.7.0     enabled   ReactPHP-based 3rd party libraries
```

Create a director database

```
sudo mysql

CREATE DATABASE director CHARACTER SET 'utf8';
GRANT ALL ON director.* TO director@localhost IDENTIFIED BY 'director';
quit
```

In the web frontend go to `Configuration > Application > Resources` and create a new database resource called `Director_DB` pointing to your newly created database with the credentials you used above. Make sure that you choose `utf8` as an encoding. Validate and save changes.

Install the director module:

```
ICINGAWEB_MODULEPATH="/usr/share/icingaweb2/modules"
REPO_URL="https://github.com/icinga/icingaweb2-module-director"
TARGET_DIR="${ICINGAWEB_MODULEPATH}/director"
MODULE_VERSION="1.7.2"
sudo git clone "${REPO_URL}" "${TARGET_DIR}" --branch v${MODULE_VERSION}
```

Enable the director module

```
sudo icingacli module enable director
```

Visit the "Icinga Director" option in the web interface. Choose the database `Director_DB` and create the schema.

Then enter your host details into the Kickstart Wizard. Set the endpoint to your systems FQDN and use 127.0.0.1 for the address. This time for the ApiUser you will need to use the **`root`** user details from the `/etc/icinga2/conf.d/api-users.conf` file.

This should cause a whole host of changes to be filed and you'll notice a number in orange next to "Activity log". Click on it and then click on "Deploy 245 pending changes", where mine had 245 to apply. Once applied you can start using the Icinga Director to build your monitoring configuration - and that's a whole other topic.

## References

[https://icinga.com/docs/icingaweb2/latest/doc/01-About/](https://icinga.com/docs/icingaweb2/latest/doc/01-About/)
