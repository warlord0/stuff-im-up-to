---
pubDatetime: 2022-05-24T20:40:55Z
title: "Relearning Laravel"
tags:
  - "Laravel"
  - "php"
  - "vue.js"
  - "Web"
  - "webpack"
description: "I feel like the past few days have been quite a battle. Mostly in terms of my memory and trying to remember what I did with Laravel and how I can re-establ"
---
I feel like the past few days have been quite a battle. Mostly in terms of my memory and trying to remember what I did with Laravel and how I can re-establish a functional development system for it.

My main aims have been to build a project for LDAP authentication using Vue.js. For this I thought I'd be able to settle myself in fairly quickly with getting the components installed and being able to start development quite quickly. I guess I've forgotten more than I thought, and putting things together took longer than I realised.

## Webpack

The core of development was making sure that dev and production builds are easily managed. For development I want the browser to give me plenty of detail, hot module reloads, Javascript source maps and Vue tools.

#### webpack.mix.js

```
const mix = require('laravel-mix');

mix.js('resources/js/app.js', 'public/js').vue()
    .postCss('resources/css/app.css', 'public/css', [
        require('postcss-import'),
        require('tailwindcss'),
    ])
    .alias({
        '@': 'resources/js',
    });

if (mix.inProduction()) {
    mix.version();
} else {

    mix.sourceMaps();

    mix.options({
        hmrOptions: {
            host: '192.168.122.191',
            port: 8080
        }
    });

    mix.browserSync('http://192.168.122.191:8000');

}
```

Then in my one and only blade template:

```
@env ('local')
    http://localhost:3000/browser-sync/browser-sync-client.js
@endenv
```

This loads the browser-sync component, so I get the browser update when I alter the code.

Run the server and hot module reloading with two windows/sessions:

```
./artisan serve --host=0.0.0.0
npm run hot
```

## Vue.js

I started out with installing this with a guide I found online. Eventually I figured out if I installed a starter kit for Laravel Jetstream and used Inertia it would put all the scaffold in place for me.

```
./artisan jetstream:install inertia
```

I think I still have a ways to go with this before I fully understand what it's doing, but it looks like inertia is the glue that brings Laravel and Vue.js together (it sounds like it can also use react).

Then trying to get Vue.js initialised took me some getting right.

#### app.js

```
import { createApp, h } from 'vue';
import { createInertiaApp } from '@inertiajs/inertia-vue3';
import { InertiaProgress } from '@inertiajs/progress';

window.axios = require('axios');
// window.axios.defaults.withCredentials = true;

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => require(`./Pages/${name}.vue`),
    setup({ el, app, props, plugin }) {
        return createApp({ render: () => h(app, props) })
            .use(plugin)
            .mixin({ methods: { route } })
            .mount(el);
    },
});

InertiaProgress.init({ color: '#4B5563' });
```

The makes Laravel render my pages into a blade template by placing in the `@inertia` tag.

```
<body class="font-sans antialiased">
    @inertia
...
</body>
```

Jetstream places a series of its own Vue.js templates under `resources/js/Jetstream` and you'll find you can create your own under `app/js/Pages` and `Components` in much the same ways as I was used to.

*There's still plenty to add to my experience. Difficulties with api authentication and LDAP to come...*
