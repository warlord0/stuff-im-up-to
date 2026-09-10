---
pubDatetime: 2018-08-29T13:39:32Z
title: "When is a Question Mark not a ?"
tags:
  - "Laravel"
  - "nginx"
  - "php"
  - "Web"
heroImage: "/blog-media/2016/09/laravel.jpg"
description: "That's a morning of smashing my face on the desk again. I deployed my dev program onto a production system and then started crying as it stopped working as"
---
That's a morning of smashing my face on the desk again. I deployed my dev program onto a production system and then started crying as it stopped working as it should. It seemed that none of my query string parameters were making it through to the controller. I called up some debugging and dumped out my `$request` and `$request->all()` etc. and discovered that the parameters although shown in the browser dev window went AWOL between server and controller. On my dev environment it all acted as it should. So there must be something different. PHP v7.2 on dev and v7.0 or production maybe? No, much simpler than that. None of the Laracasts and Laravel related Googling pulled up any particular clues. It wasn't until I looked at Nginx and parameters not being passed to PHP that I got a hit.

> [https://serverfault.com/questions/685525/nginx-php-fpm-query-parameters-wont-be-passed-to-php](https://serverfault.com/questions/685525/nginx-php-fpm-query-parameters-wont-be-passed-to-php)

The answer was as simple as adding in the `$is_args` into my Nginx virtual server config.

    location / {
      try_files %uri $uri/ /index.php$is_args$query_string;
    }

Up until now I guess I've been using routing with the parameters as part of the URI. Now I'm using some query string parameters I need to put in the `?`, which is the `$is_args` variable. So why not a problem in dev? Because I'm not using Nginx, I just use `artisan serve` to debug my development program.
