---
pubDatetime: 2016-11-18T12:58:50Z
modDatetime: 2016-11-18T14:52:05Z
title: "gulp.js"
tags:
  - "gulp"
  - "JavaScript"
  - "node.js"
  - "Web"
description: "I'm not sure I've ever felt more out of my depth than getting involved with Electron and Node.js. It's just opened up a can of worms! Just trying to get my"
---
I'm not sure I've ever felt more out of my depth than getting involved with Electron and Node.js. It's just opened up a can of worms! Just trying to get my head around Node.js lead me into the world of [Gulp.js](http://gulpjs.com/). The more I move forward the more I seem to find there's another layer waiting to be exposed. It's actually quite daunting.

## So what's the story with gulp?

Gulp is an automation engine. You add it to your project and you can get it to carry out the mundane tasks that you'd want to do to tidy up your code before distribution. eg. Minify your JavaScript and compile your Sass to CSS (that's a whole other story) Gulp itself is a JavaScript powered by Node.js so you'll need Node.js installed first. Then it's just a case of installing it and adding in the plugin modules you want to use in your project. You then write a `gulpfile.js` script for your project so that when you run gulp it will carry out all the automated tasks you want it to. This all came together for me by reading a blog post [here](https://travismaynard.com/writing/getting-started-with-gulp). It claims to be fruit based, but seems to work just fine on my Windows box with one small addition. The plugin `gulp-jshint` borked with an error message:

    Error: Cannot find module 'jshint/src/cli'
        at Function.Module._resolveFilename (module.js:469:15)
        at Function.Module._load (module.js:417:25)
        at Module.require (module.js:497:17)
        at require (internal/module.js:20:19)
        at Object. (C:\...\myapp\node_modules\gulp-jshint\src\extract.js:1:79)
        at Module._compile (module.js:570:32)
        at Object.Module._extensions..js (module.js:579:10)
        at Module.load (module.js:487:32)
        at tryModuleLoad (module.js:446:12)
        at Function.Module._load (module.js:438:3)

All  that was required was the installation of the npm module jshint.

    > npm install jshint --save-dev

Had I been paying proper attention it clearly told me that when I tried installing the module.

    npm WARN gulp-jshint@2.0.4 requires a peer of jshint@2.x but none was installed.
