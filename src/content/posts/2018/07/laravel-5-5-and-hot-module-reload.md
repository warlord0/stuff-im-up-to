---
pubDatetime: 2018-07-20T14:26:52Z
modDatetime: 2019-01-15T10:15:07Z
title: "Laravel 5.5 and Hot Module Reload"
tags:
  - "JavaScript"
  - "Laravel"
  - "Linux"
  - "node.js"
  - "Web"
heroImage: "/blog-media/2018/03/vue-laravel.png"
description: "Using Hot Module Reload (HMR) with Laravel"
---
Revisiting a previous post  about [vue-cli 3 and hmr](/posts/vue-cli-3-and-hmr/) I tried to get HMR going in a similar fashion through Laravel-mix.

First mistake to make is that laravel-mix does not need BrowserSync for HMR. So don't install it or configure it in the `webpack.mix.js` file.

HMR on Laravel 5.5 is loaded by running the `package.json` "hot" script:

```
$ npm run hot
```

It compiles the assets and sits there doing apparently nothing. When actually it's listening on `localhost:8080` for HMR/WDS connections. Whilst in this state if you open another session and serve your project using artisan, HMR just works...

```
$ php artisan serve
```

... if you are developing on the same "localhost" as the HMR and artisan server are running on.

> But what if you're not?

I tend to fire up a virtual host with Laravel installed so can't access it as "localhost" I must use one of it's public interfaces such as 192.168.56.2.

To make laravel-mix HMR run on one of your public interfaces you'll need to edit you `webpack.mix.js` file and add it the following as per your serving host:

```
mix.options({
  hmrOptions: {
    host: '192.168.56.2',
    port: 8080
  }
});
```

In your blade template ensure you refer to your assets using the form `src="{{ mix('js/app.js') }}"` as using it like this handles adjusting the host in the blade based on if you are running the hot script or not.

You MUST run two sessions to use HMR. One to run the hot compiler and one to serve the php environment with artisan. I've had frustrating times trying to use & for task spawning.

In session one:

```
$ npm run hot
```

In session two:

```
$ php artisan serve --host 192.168.56.2
```

Visit your app at: `http://192.168.56.2:8000` and you'll get your artisan served php project.

If you inspect the page in your browser you'll see the mix src becomes `//192.168.56.2:8080/app.js` because of the `webpack.mix.js` change - NOT the artisan serve.

### A Further Note

The ability to overwrite the config for `hmrOption` looks like a laravel-mix ^2.0 thing. I just spent an hour wondering why another project was failing to run on anything other than localhost when the option set.

Upgrading to laravel-mix ^2.0 in `composer.json`​ resolved the problem.
