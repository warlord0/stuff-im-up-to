---
pubDatetime: 2019-01-02T11:24:26Z
modDatetime: 2020-05-15T16:16:42Z
title: "php 7.0 on Debian Buster"
tags:
  - "debian"
  - "Linux"
  - "php"
  - "Web"
heroImage: "/blog-media/2016/09/elephpant_-_mascot_php.png"
description: "Actually this is more about any version of php (5.6, 7.0, 7.1, 7.2) on buster. Php source has taken on a bit of a split and the standard repositories only deal with the one supported version for the current release of Debian you are using."
---
Actually this is more about any version of php (5.6, 7.0, 7.1, 7.2) on buster. Php source has taken on a bit of a split and the standard repositories only deal with the one supported version for the current release of Debian you are using.

> This means that on Debian 9 (buster/sid) the only version available from the Debian repository is php 7.3.

Our current production systems are Debian 9 stretch and only support php 7.0 and therefore only Laravel 5.5. In order to bring my development platform down to php 7.0 I must use a non-standard repository.

[Ondřej Surý](https://deb.sury.org/) has been packaging php for Debian and Ubuntu and distributing them. To get them you need to add his key and repository into your aptitude:

```
$ wget -q https://packages.sury.org/php/apt.gpg -O- | sudo apt-key add -
$ echo "deb https://packages.sury.org/php/ buster main" | sudo tee /etc/apt/sources.list.d/php.list
```

Now you can add in whatever version of php you'd like even 5.6. eg.

```
$ sudo apt-get install php7.0-fpm php7.0-mbstring php7.0-zip php7.0-mysql php7.0-sqlite3 php7.0-dev php-pear
```

If you already had 7.3 installed nothing will have changed yet and when you type php from the command line you'll see it still runs version 7.3.

```
$ php -v

 PHP 7.3.0-2+0~20181217092659.24+stretch~1.gbp54e52f (cli) (built: Dec 17 2018 09:26:59) ( NTS )
 Copyright (c) 1997-2018 The PHP Group
 Zend Engine v3.3.0-dev, Copyright (c) 1998-2018 Zend Technologies
     with Zend OPcache v7.3.0-2+0~20181217092659.24+stretch~1.gbp54e52f, Copyright (c) 1999-2018, by Zend Technologies
```

To switch back to 7.0 use the following and you'll see your php go back to 7.0. Switch back in the same way, but replace 7.0 with 7.3.

```
$ sudo update-alternatives --set php /usr/bin/php7.0

 update-alternatives: using /usr/bin/php7.0 to provide /usr/bin/php (php) in manual mode
```

```
$ php -v

PHP 7.0.33-1+0~20181208203126.8+stretch~1.gbp2ff763 (cli) (built: Dec  8 2018 20:31:26) ( NTS )
 Copyright (c) 1997-2017 The PHP Group
 Zend Engine v3.0.0, Copyright (c) 1998-2017 Zend Technologies
     with Zend OPcache v7.0.33-1+0~20181208203126.8+stretch~1.gbp2ff763, Copyright (c) 1999-2017, by Zend Technologies
```
