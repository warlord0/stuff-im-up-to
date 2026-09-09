---
pubDatetime: 2018-08-30T08:51:53Z
modDatetime: 2018-08-30T13:00:17Z
title: "Verint Online Forms"
tags:
  - "Linux"
  - "Web"
description: "We're new to this and trying to integrate a form solution with our Lagan CRM system. We have a corporately installed test and production system for forms,"
---
We're new to this and trying to integrate a form solution with our Lagan CRM system. We have a corporately installed test and production system for forms, but it get frequent usage by many non-IT related staff, so I thought about deploying our own dev system. The forms products are pretty much Jetty programs with a database requirement. Looking at the config files for the initial deployment package they are looking for either H2, Oracle or MSSQL. That means our only real dev option is H2.

## Step 1 - Install the H2 database

Download the platform independent zip from [http://www.h2database.com/html/main.html](http://www.h2database.com/html/main.html) and extract it into a suitable location. Make sure you have a \$JAVA_HOME environment variable set, and ensure you have a Java JDK (not just a JRE) installed. On my Debian system I set it to the default java instance (which just happens to be Java 10):

    $ export JAVA_HOME=/usr/lib/jvm/default-java

Then run the H2 program:

    $ cd h2/bin
    $ sh ./h2.sh

This fires up a browser session and gives you an icon in the tray if you're running a windowed environment.

## Step 2 - Install dforms

Extract the dfoms zip file. Edit the `config.sh` file in `dforms-x.x.x/bin` as necessary. The only changes I made to this one was the jdbc user and password. I prefer not to use defaults. Run the program:

    $ cd dforms-x.x.x/bin
    $ sh ./Run.sh

We then have a running dforms program listening on the default port 9081. You can use your browser to visit it at `http://localhost:9081/auth/login` and logon using the defaults Admin/Admin credentials.

## Step 3 - Install dforms-leadapter

Extract the dfoms-leadapter-x.x.x zip file. Edit the `config.sh` file in `dforms-leadapter-x.x.x/bin` as necessary. I made a few more changes to this one, again the jdbc user and password - it is a different database than the dforms one and there are two of them in this config. But also the `flweb_lagan_uri` and `flweb_user` and `flweb_password` to match our environment. Run the program:

    $ cd dforms-leadapter-x.x.x/bin
    $ sh ./Run.sh

We then have a running dforms-leadapter program listening on the default port 9082. You can use your browser to visit it at `http://localhost:9082/auth/login` and logon using the defaults Admin/Admin credentials.
