---
pubDatetime: 2018-02-05T12:24:48Z
title: "PHP7.2 and MSSQL Drivers"
tags:
  - "Laravel"
  - "Linux"
  - "mssql"
  - "php"
heroImage: "/blog-media/2016/09/elephpant_-_mascot_php.png"
description: "I upgraded to PHP v7.2 on my Debian Buster/Sid today. Not a problem until I realised I'd broken my Microsoft SQL Drivers."
---
I upgraded to PHP v7.2 on my Debian Buster/Sid today. Not a problem until I realised I'd broken my Microsoft SQL Drivers. The real reason for my update from v7.0 to v7.2 was down to a problem I suffered with some Laravel console commands I was working on. When I ran a CLI based command `php artisan group:command`, which is a command I'm writing that uses a model from an MSSQL server. It would come up with an error message:

    In Connection.php line 664:
                                                                                   
      could not find driver (SQL: select top 1 * from [vwContract] order by [Ref]  
       asc)                                                                        
                                                                                   
    In Connector.php line 67:
                             
      could not find driver  

But when using the same model on a web page things worked just fine. Having a look at the CLI the version of php I was running was 7.2, but the FPM (web version) was still 7.0. Somewhere along the way a new version of PHP CLI had been installed and no driver for the CLI environment existed. To fix it I first needed to upgrade all of PHP v7.0 to v7.2 by removing and reinstalling it.

    $ sudo apt-get remove php-common
    $ sudo apt-get autoremove
    $ sudo apt-get install php-fpm php-mbstring php-zip php-mysql php-sqlite3 php-dev php-pear

Now with PHP up to date I had to uninstall/reinstall the MSSQL drivers. Which recompiled them and puts them into `/usr/lib/php/20170718`.

    $ sudo pecl uninstall sqlsrv
    $ sudo pecl uninstall pdo_sqlsrv

    $ sudo pecl install sqlsrv
    $ sudo pecl install pdo_sqlsrv

Then create or update the `sqlsrv.ini` file in `/etc/php/7.2/mods-available` and link it in both `/etc/php/7.2/cli` and `/etc/php/7.2/fpm`

### References

[/posts/php7-0-microsoft-sql-driver-debian-stretch/](/posts/php7-0-microsoft-sql-driver-debian-stretch/)
