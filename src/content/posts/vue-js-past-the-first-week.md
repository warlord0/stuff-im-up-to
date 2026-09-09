---
pubDatetime: 2018-03-21T19:49:04Z
modDatetime: 2018-08-01T19:14:52Z
title: "Vue.js - Past the First Week"
tags:
  - "Bootstrap"
  - "JavaScript"
  - "Laravel"
  - "php"
  - "vue.js"
  - "Web"
description: "I started recoding a project that I'd only just built using Vue.js as an exercise in learning Vue. The project had only just been deployed using Laravel 5."
---
I started recoding a project that I'd only just built using Vue.js as an exercise in learning Vue. The project had only just been deployed using Laravel 5.5, Bootstrap 3 and jQuery. So I rewrote it and used Laravel 5.5, Bootstrap 4 and Vue.js. The initial project delivered a nav menu driven series of pages that presented tabular results with a search/filter capability, with some Ajax/XHR calls to update datatables. I'd built several blade templates to deliver the content and used some excellent Open Source code for building PHP forms for the filters and result details - Kris' [laravel-form-builder](https://github.com/kristijanhusak/laravel-form-builder). I used [DataTables.net](https://datatables.net/) to present columns of data and it all came together quite well. But then I switched to Vue.js and replaced the form builder and datatables with [bootstrap-vue](https://bootstrap-vue.js.org/). Vue.js was a huge shift in thinking for me. I'm not a JavaScript whizz by any stretch of the imagination. So the change from DOM selectors in jQuery to Vue components is a real mind set change. *It seems strange to be putting code back into template (.vue) files - didn't we used to separate templates from code?* Bootstrap-vue enabled me to move the form construction out of PHP and into JavaScript. So it effectively wiped out all the blade templates I'd created. It wiped out all the PHP forms too. But because Vue.js is data aware and Bootstrap-vue brings a data binding into a regular Bootstrap table there's no need for datatables either. In this particular case, as it's suited as a Single Page Application (SPA), my web routes all but disappeared. I now only need one route to direct it to use the vue-router. Most of my Laravel routes became api routes that feed the Vue.js components with json data.

    Route::get('/{any}', function () {
        return view('index');
    })->where('any', '.*');

But what I notice is all of the application execution gets strongly pushed out to the client. Once webpack/Laravel mix compiles the assets I end up with a relatively tiny `app.js`, that has all my code, the forms and templates that were previously delivered using PHP. So now the server is handing out `app.js` and the client is doing all the rendering and routing without talking to the server. The only things that the server needs to provide is the json data for the Vue components.

> It's a bit like taking all of my blades and forms and navigation, throwing it all out to the client and saying don't bother me unless it's data you need. Very slick.

Less Laravel routing also means my controllers have shrunk and seem to only provide server based logic to run database queries and deliver json back to the client. From the end user point of view they'll not notice anything different in the way the app is delivered. It actually seems more snappy between pages, but that's simply because the pages are effectively already in the browser and don't need fetching from the server. I trimmed down my `webpack.mix.js` so it compiles down to the 3 core js files, `manifest.js`, `vendor.js` and my code is in `app.js`.

    mix.js('resources/assets/js/app.js', 'public/js')
      .sass('resources/assets/sass/app.scss', 'public/css')
      .extract(['vue', 'bootstrap', 'moment', 'jquery',
        '@fortawesome/fontawesome', '@fortawesome/fontawesome-free-regular', '@fortawesome/fontawesome-free-solid',
        'axios', 'es6-promise',
        'lodash', 'popper.js/dist/umd/popper'
      ])
      .version();

I guess it's not necessary to separate out the vendor parts, but as they aren't changing as often as my code why not. So I guess the change to Vue.js makes it sensible to use axios now. Now more need for jQuery `$.ajax()`​.
