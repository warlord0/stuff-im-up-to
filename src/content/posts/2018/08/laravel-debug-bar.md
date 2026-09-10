---
pubDatetime: 2018-08-06T08:54:00Z
modDatetime: 2018-08-06T18:45:48Z
title: "Laravel Debug Bar"
tags:
  - "Laravel"
  - "php"
  - "Web"
heroImage: "/blog-media/2016/09/laravel.jpg"
description: "It's a good job my job title doesn't include development. Some things I find out seem a long time after I need then and would be useful in the world of dev"
---
It's a good job my job title doesn't include development. Some things I find out seem a long time after I need then and would be useful in the world of development. My latest discovery is the Laravel debug bar. [https://github.com/barryvdh/laravel-debugbar](https://github.com/barryvdh/laravel-debugbar) Using it means not so many `dd()` or `dump()` in my code to find out what Laravel sees. It even allows me to see the actual SQL queries being used. ![Selection_073](/blog-media/2018/08/selection_073.png) Laravel Debug Bar In many ways I wish I'd discovered this sooner. Installation is very simple, just a `composer require` and then ensure your `.env` has the debug option enabled and/or debug bar enabled.

    APP_DEBUG=true
    DEBUGBAR_ENABLED=true
