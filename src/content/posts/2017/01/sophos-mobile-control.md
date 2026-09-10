---
pubDatetime: 2017-01-24T11:56:03Z
title: "Sophos Mobile Control"
tags:
  - "Security"
  - "Windows"
heroImage: "/blog-media/2017/01/smc.png"
description: "When upgrading from v6.1.4 to v7.0.8 I ran aground as it came up with a very bland error message: \"Error! Database update error. Please contact support.\" N"
---
When upgrading from v6.1.4 to v7.0.8 I ran aground as it came up with a very bland error message: "Error! Database update error. Please contact support." Not very helpful. So the next step is to look in the logfiles under the `Sophos Mobile Control\wildfly\standalone\log` called `SMCSVC_install.log` and `install_wizard.log`. These both pointed to an issue connecting to the database because it couldn't find the MySQL driver.

    [2017-01-24 10:16:06] Checking database version...
    [2017-01-24 10:16:06] Cannot get current DB version: 24-Jan-2017 10:16:06 <SEVERE> Script C:\Program Files (x86)\Sophos\Sophos Mobile Control\tools\Wizard\GetDBVersionDetails.xml execution failed.
    Driver class com.mysql.jdbc.Driver not found for ConnectionParameters{Properties{{}}, url='jdbc:mysql://localhost/SMCDBv2?autoReconnect=true', user='SMC_vvdeeywm8r', password='********************************', schema='null', catalog='null'}.Please check if the class name is correct and required libraries available on classpath

    [2017-01-24 10:16:06] Other MS SQL or MySQL/MariaDB
    [2017-01-24 10:16:06] Unkown MS SQL or MySQL/MariaDB. Setting empty dialect for auto-detection
    [2017-01-24 10:16:06] Checking database size...
    [2017-01-24 10:16:07] Cannot get current DB size: 24-Jan-2017 10:16:06 <SEVERE> Script C:\Program Files (x86)\Sophos\Sophos Mobile Control\tools\Wizard\GetDBSize.xml execution failed.
    Driver class com.mysql.jdbc.Driver not found for ConnectionParameters{Properties{{}}, url='jdbc:mysql://localhost/SMCDBv2?autoReconnect=true', user='SMC_vvdeeywm8r', password='********************************', schema='null', catalog='null'}.Please check if the class name is correct and required libraries available on classpath

    [2017-01-24 10:16:07] Checking for DB update...
    [2017-01-24 10:16:07] CheckDB_MDM Error! Please select an existing Sophos Mobile Control database. 0 24-Jan-2017 10:16:07 <SEVERE> Script C:\Program Files (x86)\Sophos\Sophos Mobile Control\tools\Wizard\CheckDB_Version.xml execution failed.
    Driver class com.mysql.jdbc.Driver not found for ConnectionParameters{Properties{{}}, url='jdbc:mysql://localhost/SMCDBv2?autoReconnect=true', user='SMC_vvdeeywm8r', password='*'}.Please check if the class name is correct and required libraries available on classpath

Well try as I might I coudn't find the mysql driver, but noticed references to mariadb in there. So I figured I'd have a look for that. and there it was. No sign of Mysql, but the MariaDB .jar driver is installed. I then opened up the `mdm.properties` file under `Sophos Mobile Control\tools\Wizard` and changed the references to myql to mariadb: `driver=com.mysql.jdbc.Driver` to `driver=org.mariadb.jdbc.Driver` and changed all references for `jdbc:mysql` to `jdbc:mariadb` Then re-ran the setup program and it connected to the database, carried out the necessary updates and then the new service started up. So it all went well and now we're running v7.0.8
