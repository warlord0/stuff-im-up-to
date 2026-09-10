---
pubDatetime: 2016-12-20T10:19:30Z
modDatetime: 2016-12-20T10:20:54Z
title: "Making Sense of React & Webpack"
tags:
  - "JavaScript"
  - "ReactJS"
  - "Web"
  - "webpack"
heroImage: "/blog-media/2016/12/what-is-webpack.png"
description: "So I came across React and thought it looked pretty cool. But it made my head hurt trying to figure it out. Everything seems so difficult to start with. I"
---
So I came across React and thought it looked pretty cool. But it made my head hurt trying to figure it out. Everything seems so difficult to start with. I just couldn't understand how you'd write a JSX file and still somehow the browser would be able to execute it. I had to eventually think back about how CoffeeScript works. The browser doesn't execute a JSX file. It needs to be "transpiled" into JavaScript in much the same way as CoffeeScript is "transpiled" into JavaScript. It's just the tools to do it are all freakishly new to me and that's what I had to get my head around. [**Webpack**](https://webpack.github.io/) - think of Gulp plus. It's a task automation tool that bundles together JavaScript and CSS files and adds cache busting to it. So a bit like Laravel's Elixir too then. So many tools! [**Babel**](https://babeljs.io/) - a JavaScript compiler. It has a number of presets (plugins) that enables the compiling of React JSX or ES2015 to JavaScript. React is pretty useless without webpack and Babel. You can write React in raw `.js` files, but the power is really in writing React as `.jsx` This is because JSX has a number of formatting differences that enable you mix JavaScript and html into the same file. Then when the JSX is compiled it becomes browser compatible JavaScript.

### Getting Started

You'll first need to install react as a dependency and webpack and babel into your project as dev dependencies.

    $ npm i --save react react-dom
    $ npm i --save-dev webpack
    $ npm i --save-dev babel-loader babel-preset-es2015 babel-preset-react

Then you'll need a `.babelrc` file for the projects babel configuration.

    {
      "presets": ["es2015", "react"]
    }

Then a `webpack.config.js` file to drive webpack to build your source files, in much the same way as you'd use a `gulpfile.js`.

    var path = require('path');
    var HtmlwebpackPlugin = require('html-webpack-plugin');

    const PATHS = {
      app: path.join(__dirname, 'app/js'),
      src: path.join(__dirname, 'src/js')
    };

    module.exports = {
      entry: PATHS.src,
      output: {
        path: PATHS.app,
        filename: 'bundle.js'
      },
      module: {
        loaders: [
          { test: /\.jsx?$/, exclude: /node_modules/, loader: "babel-loader"}
        ]
      }
    };

Now when you run webbpack it will read your .jsx files from your src directory and compile them into your app folder. There's quite a bit more you can do with webpack. In fact you'll probably be replacing Gulp and Elixir with it where your projects use React. But this is the basis of making it work. **Further reading:** [https://medium.com/@StevenLeiva1/npm-webpack-babel-and-reactjs-configuring-your-tools-ad15321e8b3e#.bl2dln55z](https://medium.com/@StevenLeiva1/npm-webpack-babel-and-reactjs-configuring-your-tools-ad15321e8b3e#.bl2dln55z)
