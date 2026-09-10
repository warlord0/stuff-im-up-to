---
pubDatetime: 2018-02-20T14:55:05Z
modDatetime: 2018-03-12T17:33:40Z
title: "Fontawesome 5 and Laravel 5"
tags:
  - "Bootstrap"
  - "Laravel"
  - "Web"
heroImage: "/blog-media/2016/09/laravel.jpg"
description: "This should have been easier, but I must have misunderstood how this works. After upgrading to Bootstrap 4, for some reason my node_modules didn't contain"
---
This should have been easier, but I must have misunderstood how this works. After upgrading to Bootstrap 4, for some reason my `node_modules` didn't contain fontawesome anymore. I don't know what I did, but I took it as a sign to upgrade to fontawesome 5. This was a little tricky to follow at first as it works differently to fontawesome 4. Install fontawesome, install the libraries you want to use so they can be used in Bootstrap.

    $ npm i --save @fortawesome/fontawesome
    $ npm i --save @fortawesome/fontawesome-free-solid
    $ npm i --save @fortawesome/fontawesome-free-regular
    $ npm i --save @fortawesome/fontawesome-free-brands

In your `resources/assets/js/bootstrap.js`:

    require('@fortawesome/fontawesome');
    require('@fortawesome/fontawesome-free-solid');
    require('@fortawesome/fontawesome-free-regular');
    require(‘@fortawesome/fontawesome-free-brands’);

Compile it using dev or watch.

    $ npm run dev

That's it. Now you can use the `class="fa fa-..."` tags as expected. You might find some of your existing fa's are no longer included free. So checkout the [fontawesome](https://fontawesome.com/icons?d=gallery&m=free) site and choose icons to replace them with.

### References

[https://fontawesome.com/icons?d=gallery&m=free](https://fontawesome.com/icons?d=gallery&m=free)
