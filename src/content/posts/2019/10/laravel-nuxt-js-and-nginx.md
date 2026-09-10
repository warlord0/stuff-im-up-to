---
pubDatetime: 2019-10-02T05:32:00Z
modDatetime: 2019-10-01T09:33:57Z
title: "Laravel, Nuxt.js and Nginx"
tags:
  - "Laravel"
  - "nginx"
  - "nuxt.js"
  - "Web"
heroImage: "/blog-media/2019/10/nuxtjs_logo.png"
description: "Whilst experimenting with Nuxt.js (A Vue.js framework) as a front end client for Laravel I discovered I was going to face some issues with CORS, certificat"
---
Whilst experimenting with [Nuxt.js](https://nuxtjs.org/) (A Vue.js framework) as a front end client for Laravel I discovered I was going to face some issues with CORS, certificates for HTTPS and the whole serving the client over port 3000 and the API over port 80 thing.

In the development environment this isn't so bad as I can run both the Laravel artisan web server and serve Nuxt.js and have them talk to each other - within reason. The problems started when I wanted to use Social Sign In using Facebook, Google etc. The callback from the OAuth process would fire, but the client would fail with CORS errors as I would have to redirect the client using the API from the OAuth callback.

To resolve this issue I tried adding in a [CORS module for Laravel](https://github.com/barryvdh/laravel-cors) and setting the values appropriately, but still failed.

So I began thinking what this would look like in production. I wouldn't want to serve the API and client separately and I'd probably put them both behind a reverse proxy, so let's look at using Nginx.

My thinking was that I can already serve a Laravel project using Nginx over HTTP or HTTPS, let's follow that plan. If I setup Nginx and PHP just the way I'd do for a regular Laravel server, I can then change it so that it only responds to calls to the location `/api` as that is all I will be using Laravel for, I wont have any web routes in Laravel as I won't be serving any client based materials like blades, css, html or compiled Vue components.

The client will be served from the Nuxt.js server. It will get all of it's client interface, css and html from Nuxt.js.

The use of Nginx as a proxy for Nuxt.js is documented [here](https://nuxtjs.org/faq/nginx-proxy). All I've done is blend that configuration with my Laravel configuration to come up with and Nginx server that serves `/api` from Laravel, and everything else `/` gets proxied to Nuxt.js (`@proxy`).

https://gist.github.com/warlord0/97e86149102557f219a4073d240fd2e3

Now I can manage any CORS requirements using the Nginx config.

What's more the basis of this config can also be used with [Laragon](/posts/developing-in-windows/) to serve from Windows.
