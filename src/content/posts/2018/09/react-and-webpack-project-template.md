---
pubDatetime: 2018-09-22T13:45:21Z
title: "React and Webpack - Project Template"
tags:
  - "JavaScript"
  - "ReactJS"
  - "Web"
  - "webpack"
heroImage: "/blog-media/2016/12/what-is-webpack.png"
description: "I've begun looking at building a project using React and followed some online sources to begin with. But then I fell into outdated material that related to"
---
I've begun looking at building a project using React and followed some online sources to begin with. But then I fell into outdated material that related to babel. So I could only take many of the tutorials so far before having to update the construction to suit @babel/core v7. It seems it's very easy to install different versions of babel and it's components and then discover things won't compile. The error message I was getting:

> Error: Plugin/Preset files are not allowed to export objects, only functions.

It doesn't exactly make clear that what you have probably done is installed a preset  from an older version of babel and your babel core doesn't like it. I then took to building a bare bones "Hello World" project to use as a re-usable react and webpack template.

## Steps to follow

Create your project folder

    $ mkdir ~/myproject
    $ cd ~/myproject

Initialise your `package.json` using yarn or npm. Set your entry point to `./client/index.js`

    $ yarn init

Add the dependencies

    $ yarn add react react-dom

Add the devDependencies

    $ yarn add @babel/core @babel/preset-env @babel/preset-react babel-loader html-webpack-plugin webpack webpack-cli webpack-dev-server -D

Edit your `package.json` so it should look something like this:

    {
      "name": "react",
      "version": "0.1.0",
      "description": "React / Webpack template",
      "main": "./client/index.js",
      "author": "Warlord",
      "license": "GPL-3.0",
      "private": false,
      "scripts": {
        "start": "webpack-dev-server"
      },
      "dependencies": {
        "react": "^16.5.2",
        "react-dom": "^16.5.2"
      },
      "devDependencies": {
        "@babel/core": "^7.1.0",
        "@babel/preset-env": "^7.1.0",
        "@babel/preset-react": "^7.0.0",
        "babel-loader": "^8.0.2",
        "html-webpack-plugin": "^3.2.0",
        "webpack": "^4.19.1",
        "webpack-cli": "^3.1.0",
        "webpack-dev-server": "^3.1.8"
      }
    }

Notice the `scripts` section has been added to start the webpack dev server.

> You could get a bit more adventurous and add a dev and prod script to either run the webpack dev server or compile into the dist folder using `webpack -p` for production minified assets.

Create a `.babelrc` file in the project root. This is babels configuration file and this is where you tell babel what presets to use. It's also where the tutorials made me fail because I was using "react" and not "@babel/preset-react".

    {
      "presets":[
        "@babel/preset-env", "@babel/preset-react"
      ]
    }

Create a client and dist folder in your project with the following structure and files:

    client
      +-- components
          App.js
      index.html
      index.js
    dist

Running `yarn start` should serve on port 8080 and you can visit your page at http://localhost:8080 The example files used are in the gist below. https://gist.github.com/warlord0/6c3d44737af648263d2a33bf22044472
