---
pubDatetime: 2018-08-01T19:04:54Z
title: "I Hate Internet Explorer"
tags:
  - "JavaScript"
  - "Laravel"
  - "Web"
  - "webpack"
description: "I just can't seem to get it to die! Probably something to do with all those users out there spoiling my day and continuing to use it in Windows 7 - sadly i"
---
I just can't seem to get it to die! Probably something to do with all those users out there spoiling my day and continuing to use it in Windows 7 - sadly in our corporate environment. I've spent a few days with a problem showing "Syntax Error" in IE11 when my project runs just great in Edge, FireFox and Chrome. After a lot of digging around in the components I've used I narrowed it down to one specific 3rd party component from npmjs. So I took a trawl through into the Github of the project and opened an issue. Turns out I'm not the only one seeing the problem. I guess everyone else is using more sensible browsers. I got a great reply that pointed me to modifying my webpack config so it transpiled into IE11 compatible code. I'd already used polyfills like `es6-promise` and `es6-object-assign` and then `babel-polyfill`, but this obviously wasn't enough. The pointer was aimed at webpack. Now Laravel uses it's own layer above webpack - Laravel-Mix, but with a bit more Googling I figured out how to add the necessary webpack config into mix to get it transpiling correctly. Add the `targets-webpack-plugin` using yarn (or npm) as a "devDependency"

    $ yarn add targets-webpack-plugin -D

In my `webpack.mix.js` file:

    const TargetsPlugin = require('targets-webpack-plugin')

    ...

    mix.webpackConfig({
      plugins: [
        new TargetsPlugin({
          browsers: ['last 2 versions', 'chrome >= 41', 'IE 11'],
        }),
      ]
    })

Repackage my app with `yarn run dev` and IE11 is silent! The internet is full of wonderfully helpful people. To those that post responses, write blogs or any kind of feed - I thank you all.
