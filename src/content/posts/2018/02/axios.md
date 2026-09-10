---
pubDatetime: 2018-02-28T13:30:46Z
modDatetime: 2018-03-06T20:06:52Z
title: "Axios"
tags:
  - "ajax"
  - "JavaScript"
  - "Laravel"
  - "Web"
heroImage: "/blog-media/2016/09/laravel.jpg"
description: "Laravel have bundled Axios in with their framework. I didn't know what this was at first and didn't use it. But once I figured out what it was for I tried"
---
Laravel have bundled [Axios](https://github.com/axios/axios) in with their framework. I didn't know what this was at first and didn't use it. But once I figured out what it was for I tried to make a gradual change in coding to start using it. The simplest way I can describe it is as a promise based replacement for jQuery `$.ajax()` for XHR submissions. The change to axios from `$.ajax()` is quite straightforward. You'll find some axios references in your `bootstrap.js` file that sets up the `CSRF-TOKEN`​. I also added in here a similar function for handling CSRF with jQuery. https://gist.github.com/warlord0/771c8009a1daa48dc5539e3d5aa57fb1 The use of axios follows a logical syntax and is easy to follow.

      axios.get('/url')
        .then(function(response) {
          var options = [];
          $(response.data.options).each(function(index, item) {
            options.push('' + item.name + '');
          });
          $('#select').append(options.join(''));
        })
        .catch(function(error) {
          console.log(error);
        });

Which is so close to the `$.ajax()` function as to be almost a drop in. My problem came when I tried to submit a form with form data using XHR and axios. I spent ages trying to generate the form data using `new FormData()` and iterating fields and couldn't get Laravel to see the Request data correctly. Then I just serialized the form and passed that as the data parameter in my `axios.put()` command. https://gist.github.com/warlord0/f58b4b6b8e5f75a1e12b6e687959bdc2

## IE11 Promise is 'undefined'

With older non-HTML5/Promise capable browsers you'll need to `polyfill()` the Promise statement by installing and requiring `es6-promise` including the following line in your `bootstrap.js`:

    $ npm install es6-promise --save-dev

### bootstrap.js

    require('es6-promise').polyfill();

## References

[https://github.com/stefanpenner/es6-promise](https://github.com/stefanpenner/es6-promise)
