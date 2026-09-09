---
pubDatetime: 2017-12-12T12:20:06Z
modDatetime: 2019-07-08T11:48:08Z
title: "PHP7.0, Microsoft SQL Driver & Debian (stretch)"
tags:
  - "Linux"
  - "mssql"
  - "php"
  - "Web"
description: "To get the MS SQL ODBC driver working even in Jessie appears to be a challenge. I Stretch I almost surrendered. It is working, but I do think it's a bit of a hack as I've had to install an older libssl1.0.0 and enable the locale en_US.UTF-8."
---
What a mission today has been. I think I'll ultimately roll back to using Debian Jessie as Stretch isn't a supported system, yet.

To get the MS SQL ODBC driver working even in Jessie appears to be a challenge. In Stretch I almost surrendered. It is working, but I do think it's a bit of a hack as I've had to install an older `libssl1.0.0` and enable the locale `en_US.UTF-8`.

As it's downloaded using apt over https you'll need to add in the `apt-transport-https` package to your system:

```
$ sudo apt-get install apt-transport-https
```

Or you will get this error

```
Reading package lists… Done                     

E: The method driver /usr/lib/apt/methods/https could not be found.

N: Is the package apt-transport-https installed?

E: Failed to fetch https://packages.microsoft.com/debian/9/prod/dists/stretch/InRelease  

E: Some index files failed to download. They have been ignored, or old ones used instead.
```

PHP development voted out the inclusion of MS SQL to the project so now you must compile and install it yourself. There are some very good instructions out there to help you - even from Microsoft.

[https://docs.microsoft.com/en-gb/sql/connect/odbc/linux-mac/installing-the-microsoft-odbc-driver-for-sql-server](https://docs.microsoft.com/en-gb/sql/connect/odbc/linux-mac/installing-the-microsoft-odbc-driver-for-sql-server)

Following this got it installed for me at least. I had to install some extra packages like `pear` so I'd be able to use `pecl`. I also needed to install `php-dev` or there's an error about phpize not found.

You also need unixodbc-dev - it says optional, but the pecl bits will fail without it.

```
$ sudo apt-get install php-dev php-pear
$ sudo pecl install sqlsrv
$ sudo pecl install pdo_sqlsrv
```

Which drags in the necessary compilers and compiles and installs the MS SQL drivers for PHP.

If you get an error at this stage you'll need to install the pear modules manually.

I've been getting:

```
$ sudo pecl install sqlsrv                                                        
No releases available for package "pecl.php.net/sqlsrv"
install failed
```

To fix this I went to find the most stable version of the package here: [http://pecl.php.net/package/sqlsrv](http://pecl.php.net/package/sqlsrv) and then downloaded and installed it using:

```
$ wget http://pecl.php.net/get/sqlsrv-5.3.0.tgz
$ sudo pear install sqlsrv-5.3.0.tgz
```

And similarly for pdo_sqlsrv:

```
$ wget http://pecl.php.net/get/pdo_sqlsrv-5.3.0.tgz
$ sudo pear install pdo_sqlsrv-5.3.0.tgz
```

After grinding for a little while, the pecl installs should result in success like this:

```
Build process completed successfully
Installing '/usr/lib/php/20151012/sqlsrv.so'
install ok: channel://pecl.php.net/sqlsrv-4.3.0
configuration option "php_ini" is not set to php.ini location
You should add "extension=sqlsrv.so" to php.ini
...
Build process completed successfully
Installing '/usr/lib/php/20151012/pdo_sqlsrv.so'
install ok: channel://pecl.php.net/pdo_sqlsrv-4.3.0
configuration option "php_ini" is not set to php.ini location
You should add "extension=pdo_sqlsrv.so" to php.ini
```

Then I created a file under `/etc/php/7.0/mods-available` called `sqlsrv.ini` and added in the matching extensions:

### sqlsrv.ini

```
extension=sqlsrv.so
extension=pdo_sqlsrv.so
```

Then create symbolic links in the `/etc/php/7.0/fpm/conf.d` that I called `20-sqlsrv.ini` and restart `php-fpm`.

```
$ sudo ln -s /etc/php/7.0/mods-available/sqlsrv.ini /etc/php/7.0/fpm/conf.d/20-sqlsrv.ini
$ sudo ln -s /etc/php/7.0/mods-available/sqlsrv.ini /etc/php/7.0/cli/conf.d/20-sqlsrv.ini
$ sudo systemctl restart php7.0-fpm.service
```

Then we can start using it in PHP.

## The Problems with Stretch

I was trying to use it in Laravel on my Stretch box, but it kept failing. I hit on a few posts that suggested the solutions. So I hacked it a bit and it works!

> SQLSTATE\[01000\]: \[unixODBC\]\[Driver Manager\]Can't open lib '/opt/microsoft/msodbcsql/lib64/libmsodbcsql-13.1.so.9.1' : file not found

This led me into having to install [libssl1.0.0](https://packages.debian.org/jessie/amd64/libssl1.0.0/download) and then I reran the pecl installs. Probably not elegant, but it's development only for me so I'll do it for now, but production I'll probably stick with Jessie.

https://github.com/Microsoft/msphpsql/issues/484

Turns out the following isn't just an issue in Stretch. I had to apply this locale fix in Jessie too.

> local.ERROR: pdo_sqlsrv_db_handle_factory: Unknown exception caught

Which I then discovered needed a locale adding.

```
$ sudo vi /etc/locale.gen
```

Uncomment the line `# en_US.UTF-8 UTF-8` and save it. Then update the locales.

```
$ sudo locale-gen
```

https://github.com/Microsoft/msphpsql/issues/391
