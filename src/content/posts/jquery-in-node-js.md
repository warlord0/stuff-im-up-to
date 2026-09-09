---
pubDatetime: 2016-11-30T21:06:36Z
title: "jQuery in Node.js"
tags:
  - "Bootstrap"
  - "JavaScript"
  - "jquery"
  - "node.js"
description: "Using jQuery in Node.js gave me something to think about. Especially as there seems to be so many ways to do it. If you're using it in a renderer you can p"
---
Using jQuery in Node.js gave me something to think about. Especially as there seems to be so many ways to do it. If you're using it in a renderer you can pretty much use it like you would in a plain old html page and use a script src. A couple of things I tried cause bootstrap to start complaining about jQuery not being defined. I eventually decided on this approach to get things working together. In your html head you'll need to include the css. You could get creative with Gulp and sass if you really want, but I'm just going for out of the box.

``` html

<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
<link rel="stylesheet" href="node_modules/font-awesome/css/font-awesome.min.css">    
```

Then in your script tags:

``` javascript

    <!-- Insert this line above script imports  -->

        if (typeof module === 'object') {
            window.module = module;
            module = undefined;
        }



        global.jQuery = require('jquery/dist/jquery.min.js');
        global.$ = jQuery;
        var jQueryUI = require('jqueryui');
        var jQueryMousewheel = require('jquery-mousewheel/jquery.mousewheel.js')($); // jQuery plugin handling
        var bootstrap = require('bootstrap');
        var tinysort = require('tinysort/dist/tinysort.js').tinysort;

    <!-- Insert this line after script imports -->

        if (window.module) module = window.module;
```

> Notice the special handling (\$) on the jQueryMousewheel plugin and the .tinysort to make these work as the should.
