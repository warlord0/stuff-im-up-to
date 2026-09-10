---
pubDatetime: 2019-07-08T20:08:45Z
title: "PHP 7.1 and MSSQL Compile Issue"
tags:
  - "Linux"
  - "mssql"
  - "php"
heroImage: "/blog-media/2016/10/mssql_logo.png"
description: "When trying to get PHP v7.1 running on a Debian Buster development box I ran into an issue where pecl would compile the sqlsrv.so and pdo_sqlsrv.so files f"
---
When trying to get PHP v7.1 running on a Debian Buster development box I ran into an issue where `pecl` would compile the `sqlsrv.so` and `pdo_sqlsrv.so` files for the wrong version of PHP.

It didn't seem obvious what was going on at first. I went through the very good [Microsoft ODBC for Linux installer guide](https://docs.microsoft.com/en-us/sql/connect/odbc/linux-mac/installing-the-microsoft-odbc-driver-for-sql-server?view=sql-server-2017) and things went well up until `pecl` delivered the drivers.

I noticed something was off as the `/usr/lib/php` folder was a folder dated `2018`, when I was expecting it to be `20160303` for PHP 7.1. I checked the settings using `update-alternatives`.

```
$ update-alternatives --list php
/usr/bin/php7.1
```

But `pecl` was obviously not compiling right. The last resort was to remove PHP v7.3 and all related modules from the system and retry.

```
$ sudo apt-get remove php7.3-common
```

Now when I recompile the drivers using `pecl install` it works just as planned.

```
$ sudo pecl install sqlsrv                                                                                
 downloading sqlsrv-5.6.1.tgz …
 Starting to download sqlsrv-5.6.1.tgz (183,396 bytes)
 …………………………………done: 183,396 bytes
 34 source files, building
 running: phpize
 Configuring for:
 PHP Api Version:         20160303
 Zend Module Api No:      20160303
 Zend Extension Api No:   320160303
...
```

And repeat for `pdo_sqlsrv.ini`, I get the `.so` files created in the `/usr/lib/php/20160303` folder. [Then add the `sqlsrv.ini` file and link it](https://warlord0blog.wordpress.com/2017/12/12/php7-0-microsoft-sql-driver-debian-stretch/), but with 7.1. After running `php -v` I see no errors and `php -m` shows the two sql modules loaded.

```
$ php -v                                                                                                  
 PHP 7.1.30-1+0~20190531112602.19+stretch~1.gbpab9d28 (cli) (built: May 31 2019 11:26:03) ( NTS )
 Copyright (c) 1997-2018 The PHP Group
 Zend Engine v3.1.0, Copyright (c) 1998-2018 Zend Technologies
     with Zend OPcache v7.1.30-1+0~20190531112602.19+stretch~1.gbpab9d28, Copyright (c) 1999-2018, by Zend Technologies
```

```
$ php -m | grep sqlsrv                                                                                    
pdo_sqlsrv
sqlsrv
```
