---
pubDatetime: 2018-07-23T18:49:24Z
title: "Laravel Vue.js and API Routes"
tags:
  - "Laravel"
  - "php"
  - "vue.js"
  - "Web"
description: "I ran into a problem where I've started to deploy Vue components using the Vue Router from within Laravel. As soon as I enabled the Vue route for /{any} I"
---
I ran into a problem where I've started to deploy Vue components using the Vue Router from within Laravel. As soon as I enabled the Vue route for `/{any}` I lost access to the api routes.

### routes/web.php

    Route::get('/{any}', function () {
      return view('home');
    })->name('home')->where('any', '.*');

    Auth::routes();

### app.js

    const routes = [
      {
        path: '/',
        name: 'home',
        component: home
      }, {
      ...
      }, {
        path: '*',
        name: 'notFound',
        component: notFound
      }
    ]

I took a look at the Laravel `RouteServiceProvider.php` and noticed that the order of the web and api providers put the web first, so I swapped them around and now my api's are back in business.

    /**
    * Define the routes for the application.
    *
    * @return void
    */
    public function map()
    {
      $this->mapApiRoutes(); // Needs to be first

      $this->mapWebRoutes();

    }
