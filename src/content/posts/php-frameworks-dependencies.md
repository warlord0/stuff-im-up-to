---
pubDatetime: 2016-09-14T13:05:18Z
modDatetime: 2016-09-18T13:19:54Z
title: "PHP Frameworks & Dependencies"
tags:
  - "composer"
  - "php"
description: "I'm not new to PHP and have used it quite often, but what I've not really used are frameworks. There are plenty of them out there all capable of different"
---
I'm not new to PHP and have used it quite often, but what I've not really used are frameworks. There are plenty of them out there all capable of different things, but all able to save a whole heap of time when it comes to developing something more than a simple script. The one I've tended to favour is '[Laravel](https://laravel.com/)'. It's pretty fully featured and fairly straight forward, but there is a lot to learn. But what it did do for me was introduce me to [composer.phar](https://getcomposer.org/) and then on to [Packagist](https://packagist.org/). The Getting Started page for composer pretty much explains what it's all about

> Composer is **not** a package manager in the same sense as Yum or Apt are. Yes, it deals with "packages" or libraries, but it manages them on a per-project basis, installing them in a directory (e.g. `vendor`) inside your project.

With composer it's a piece of cake to keep your Laravel project up to date. It downloads and installs any dependencies for the framework, but also any you may have added into your project. For example I wanted to make use of [Guzzle](http://docs.guzzlephp.org/en/latest/overview.html) for interfacing with the api of a cloud system. Installing it was a breeze. From within my project folder a simple:

    $ composer require guzzlehttp/guzzle

Got it downloaded and autoloading so the class was immediately available. What's more is when the developer updates their code it gets updated along with all my other dependancies using:

    $ composer update

So in short composer downloads packages from packagist and maintains them within your project.
