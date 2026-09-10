---
pubDatetime: 2018-04-04T09:57:18Z
modDatetime: 2018-04-04T20:20:04Z
title: "Application Construction"
tags:
  - "Bootstrap"
  - "JavaScript"
  - "Laravel"
  - "php"
  - "vue.js"
  - "Web"
heroImage: "/blog-media/2018/03/vue-laravel.png"
description: "Frameworks For rapid application development there's a lot of pre-written code out there that is mature and highly capable. There's no need to build from t"
---
# Frameworks

For rapid application development there's a lot of pre-written code out there that is mature and highly capable. There's no need to build from the ground up when you can use a framework or scaffolding to build your application.

## Laravel and Composer

My first step is to use Laravel. It's installed using composer - which is a dependency manager for PHP. This means if a PHP component you install needs and relies upon other components, they'll get installed too. Composer installs all the PHP dependencies under `./vendor` path of your project. The files in this path do not need to be included in your distribution. They can be installed and updated automatically using composer. Composer keeps track of what you install into your project in the file `composer.json`. So whenever you run `$ composer update` it will read this file and pull down all the dependencies and install them into `./vendor`.

## Node.js and NPM

Whilst I may not be developing a Node application I can certainly make use of Node for the development process. It offers some very beneficial development features. It runs webpack to monitor and compile the projects assets and browsersync to refresh my browser when an asset is updated. NPM is the package management tool that downloads and installs the Node packages required. In the same way as composer installs dependencies for PHP, NPM does this for Node/JavaScript. NPM uses the file `package.json` to monitor/manage the dependencies you install, which get installed into `./node_modules`. Again this does not need to be included in your distribution as the content you require gets compiled into your JavaScript assets. So you may not even require Node installing on your production server environment.

## Webpack

As part of the Laravel install you'll get a flavour of Webpack, or mix as Laravel terms their adaption. Webpack carries out the monitoring and compilation of assets. It takes your JavaScript and CSS/SASS files and uglifies/compresses them into smaller code only versions of your scripts. It can take a JavaScript file from 2MB of code down to less than 200kb. Simplistically it does this by stripping all of the "English" from it and shrinking your long variable and function names to what are often single character variable and function names. Removing spaces, tabs and carriage returns etc. eg.

    var my_variable_name = 1;

becomes

    var a=1;

Once the code is delivered to the browser in a production environment there is no need for the code to be human readable anymore. The primary input for webpack comes from the assets `./resources/assets/js/app.js` and `bootstrap.js` (not to be confused with the bootstrap framework). These two files are the core of your JavaScript application. Webpack compiles your assets into `./public/css/app.css` and `./public/js/app.js`. So you only have a few includes required in your projects HTML to use your assets. You can split them down further so 3rd party or vendor code is separated from your own code.

## Vue.js

Laravel ships with Vue.js these days. This is very new to me and strangely different. It's a JavaScript framework that is a totally different environment than my experience with jQuery. The main features that make it so different for me are the ability to bind data to components. This means a big change in the way you previously needed to monitor and trigger events based on changes in data. Vue.js does this for you. Vue components live with your JavaScript assets under `./resources/assets/js/components`. Once required/imported in your `app.js` file the `.vue` files get compiled into your application.

## Bootstrap and Bootstrap-vue

Bootstrap is a HTML presentation framework. it provides the visual construction of the web page that the users of your application see. It's the styling/CSS of the application. It's a distinctive style, but very powerful in that designing for mobile, tablet through to desktop presentation is a built in function of the framework. Bootstrap-vue is a Vue.js componentised implementation of Bootstrap. The need for writing HTML code in the manner of Bootstrap is taken over by writing vue components that build the Bootstrap HTML. So a Bootstrap button can become a vue component with data binding with actions and references like any other vue component. This brings program-ability to the visual presentation capabilities of Bootstrap.

## Vuetify and Material Design

As an alternate presentation framework to Bootstrap/Bootstrap-vue on one project I've used Vuetify. Vuetify again is a very distinctive style. It uses the Google Material Design styles to present your application.

# Application Delivery

After writing and testing the application locally I need to deploy it to a web server. As part of my development process I use the Git version control system. This allows me to commit changes of my code in a controlled manner and enables me to rollback to previous versions, compare changes I've made and easily deploy the code to other systems. For this I installed a Gitlab server so we have our own internal Git version control server. Using Github is only for publicly accessible code unless you take out a commercial package. Having our own Gitlab server provides the same functionality, but enables me to keep private projects internally. To deploy the code to a server is as simple as compiling my assets for production and cloning the project to the server or pulling the changes. Compile my production assets and upload/push them to the Gitlab server:

    $ npm run prod
    $ git add .
    $ git commit -m "Production deployment"
    $ git push

Then from the server clone the code and install/update the PHP dependencies:

    $ git clone git@gitlab.domain.local/projectpath/project.git
    $ composer update

or, to update the server:

    $ git pull
    $ composer update

Then it's good to go. So in all it seems a lot of components and when I started down this path I thought it all very confusing and more than a little daunting. But it's like Lego. They all snap together quite tidily and the end result is a comprehensive application development and delivery platform.
