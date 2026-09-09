---
pubDatetime: 2019-01-15T10:11:37Z
title: "Laravel 5.5 HMR and Windows"
tags:
  - "JavaScript"
  - "Laravel"
  - "Web"
  - "webpack"
  - "Windows"
description: "Using HMR in Chrome on Linux is faultless, but on Windows HMR fails to start in the browser. Looking at the entries in the bowsers script tags they seem a"
---
Using [HMR](https://warlord0blog.wordpress.com/2018/07/20/laravel-5-5-and-hot-module-reload/) in Chrome on Linux is faultless, but on Windows HMR fails to start in the browser.

Looking at the entries in the bowsers script tags they seem a bit goofy. There's leading slashes and spaces before the script filename.

It seems this is a popular issue. We hunted around for quite a few pointers to resolve this.

[https://github.com/JeffreyWay/laravel-mix/issues/1437](https://github.com/JeffreyWay/laravel-mix/issues/1437#issuecomment-365484126)

The only thing we changed was line 90 of `Entry.js` to add on the extra `replace(/^\//, '');` A restart of `yarn hot` and a browser refresh and we were good to go. HMR and WDS show in the Chrome console as expected and changes to code are now dynamic.
