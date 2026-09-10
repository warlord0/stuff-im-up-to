---
pubDatetime: 2018-03-15T15:40:24Z
modDatetime: 2018-08-01T19:15:17Z
title: "failed to mount component: template or render function not defined."
tags:
  - "JavaScript"
  - "Laravel"
  - "vue.js"
  - "Web"
heroImage: "/blog-media/2018/07/vue1.png"
description: "Today I have been mostly smashing my head on the desk trying to figure out Laravel and Vue.js. I thought I'd try to template an existing Laravel 5.5 projec"
---
Today I have been mostly smashing my head on the desk trying to figure out Laravel and Vue.js. I thought I'd try to template an existing Laravel 5.5 project using Vue.js. Try as I might I could not get the template to work. I even stuck with the default `example-component` trying to get that to work . All I saw was an error reported in the console.

    failed to mount component: template or render function not defined.

So I deployed a completely new Laravel project and added the `example-component` into the welcome page and it worked! So what's different with my project? My `app.js` has the same entries:

    window.Vue = require('vue');

    /**
     * Next, we will create a fresh Vue application instance and attach it to
     * the page. Then, you may begin adding components to this application
     * or customize the JavaScript scaffolding to fit your unique needs.
     */

    Vue.component('example-component', require('./components/ExampleComponent.vue'));

    const app = new Vue({
        el: '#app'
    });

But the versions in my `package.json` are a little different. Non-working:

        "devDependencies": {
            "axios": "^0.18.0",
            "popper.js": "^1.14.1",
            "bootstrap": "^4.0.0",
            "cross-env": "^5.1.4",
            "jquery": "^3.2",
            "laravel-mix": "^1.0",
            "lodash": "^4.17.4",
            "vue": "^2.5.16"
        }

Working:

        "devDependencies": {
            "axios": "^0.17",
            "bootstrap-sass": "^3.3.7",
            "cross-env": "^5.1",
            "jquery": "^3.2",
            "laravel-mix": "^1.0",
            "lodash": "^4.17.4",
            "vue": "^2.5.7"
        }

So no huge difference. But obviously enough. I spent the day googling and then came across the solution that meant I just change my component import to:

    Vue.component('example-component', 
      require('./components/ExampleComponent.vue').default
    );

Just adding a `.default` that was the pointer from the post by **aeolusheath** on 15 Nov 2017 [https://github.com/vuejs/vue-router/issues/1882](https://github.com/vuejs/vue-router/issues/1882) Or as detailed further down, adjust the app Vue to include the component:

    const app = new Vue({
      el: '#app',
      components: {
        'example-component'​
      } 
    });
