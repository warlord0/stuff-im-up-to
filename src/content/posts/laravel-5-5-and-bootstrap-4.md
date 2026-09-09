---
pubDatetime: 2018-07-30T07:15:09Z
modDatetime: 2018-09-28T10:19:49Z
title: "Laravel 5.5 and Bootstrap 4"
tags:
  - "Bootstrap"
  - "Laravel"
  - "Web"
description: "Laravel 5.5 ships with Bootstrap 3. To make it use Bootstrap 4 you need to make a few changes. resources/assets/js/bootstrap.js Change require('bootstrap-s"
---
Laravel 5.5 ships with Bootstrap 3. To make it use Bootstrap 4 you need to make a few changes.

### resources/assets/js/bootstrap.js

Change `require('bootstrap-sass')` to `require('bootstrap')`

### resources/assets/sass/app.scss

Change `@import('~bootstrap-sass/assets/stylesheets/bootstrap');` to `@import "~bootstrap/scss/bootstrap";`

### resources/assets/sass/\_variables.scss

Change `$font-size-base: 14px;` to `$font-size-base: 1rem;`

### Remove Bootstrap 3 using

    $ npm remove bootstrap-sass

### Install Bootstrap 4 using

    $ npm install bootstrap

### Rebuild your project

    $ npm run dev
