---
pubDatetime: 2016-12-08T21:47:58Z
modDatetime: 2016-12-09T17:18:05Z
title: "CoffeeScript"
tags:
  - "CoffeeScript"
  - "JavaScript"
heroImage: "/blog-media/2016/12/coffeescript11.png"
description: "It's like JavaScript, but less of a grind... well maybe. I've been on a mission of discovery and uncovered all kinds of new stuff recently. From Electron,"
---
### It's like JavaScript, but less of a grind... well maybe.

I've been on a mission of discovery and uncovered all kinds of new stuff recently. From Electron, Node.js, GulpJS etc. CoffeeScript is my latest encounter on this path. CoffeeScript is a language that compiles into JavaScript -- which I think is wrong because JavaScript isn't compiled, but then let's not mess with semantics. [http://coffeescript.org/](http://coffeescript.org/) Basically what it does is allows you to write a more simplistic version of JavaScript and "compile" it into the full blown JavaScript version. It has some pretty handy features, but sure takes some getting used to. One of the nicest features (and also a little frustrating) is the for ... loop. It's nice how you don't have to deal with indexed arrays if you use it. It indexes the array for you, but then allows you to reference the content like in a foreach singular, plural type manner. eg `dothis for file in files` Which results in

    for (i = 0, len = files.length; i < len; i++) {
        file = files[i];
        dothis(file);
    }

One of the biggest things it handles for you is all the comma and semicolon malarkey that is an everyday frustration of writing JavaScript. It simplifies things so much that much of your code loses brackets (both round and curly), commas and semicolons. That's not to say it doesn't have it's quirks, but if you're able to write JavaScript it's easy to pick up CoffeeScript. The way it works is you write your script as an indented style `.coffee` file eg. `main.coffee` and then you use the coffee processor to "compile" the `.coffee` into a regular `.js` - `main.js` file. You can even have the coffee processor watch your filesystem for changes so as you save the `.coffee` file it will automatically create the `.js` file for you. So far I'm a little uncertain about it's value to me personally. I find it's tricky to troubleshoot as I need to look at the JavaScript it generated anyhow. Then once I've found the problem I need to translate the solution into CoffeeScript to get it to "compile" it back to JavaScript and retest it.

> Seriously, 10 minutes after writing this I discover "source maps". Just add --map to your cofffee processor and it'll create a map file that when you're debugging in your browser it looks at your actual CoffeeScript, so you can spot any issues in the CoffeeScript code without necessarily looking at the JavaScript. Very cool!

Without a doubt it's resulted in fewer lines of code to generate the same JavaScript output, but is it saving me any time really? I'm not so sure as it's taking me on a journey to learn another language, which when you need to know JavaScript anyhow, seems a little unnecessary. By way of example from a snippet I'm using, here's the CoffeeScript:

    getDir = (p) ->
        fs = require 'fs'
        path = require 'path'
        os = require 'os'
        nodes = []

        if p is ROOT and os.platform() is 'win32'
            drives = getWindowsDrives()
            console.log drives
            for drive in drives
                nodes.push
                    title: drive + path.sep
                    expanded: false
                    folder: true
                    lazy: true
                    key: drive + path.sep
        else
            files = fs.readdirSync p
            for file in files
                try
                    if not fs.statSync(path.join(p, file)).isFile()
                        nodes.push
                            title: file
                            expanded: false
                            folder: true
                            lazy: true
                            key: path.join p, file
                catch error
                    console.error error
        console.log nodes
        return nodes

  and here's the resultant JavaScript that it compiled.

      getDir = function(p) {
        var drive, drives, error, file, files, fs, j, k, len, len1, nodes, os, path;
        fs = require('fs');
        path = require('path');
        os = require('os');
        nodes = [];
        if (p === ROOT && os.platform() === 'win32') {
          drives = getWindowsDrives();
          console.log(drives);
          for (j = 0, len = drives.length; j < len; j++) {
            drive = drives[j];
            nodes.push({
              title: drive + path.sep,
              expanded: false,
              folder: true,
              lazy: true,
              key: drive + path.sep
            });
          }
        } else {
          files = fs.readdirSync(p);
          for (k = 0, len1 = files.length; k < len1; k++) {
            file = files[k];
            try {
              if (!fs.statSync(path.join(p, file)).isFile()) {
                nodes.push({
                  title: file,
                  expanded: false,
                  folder: true,
                  lazy: true,
                  key: path.join(p, file)
                });
              }
            } catch (error1) {
              error = error1;
              console.error(error);
            }
          }
        }
        console.log(nodes);
        return nodes;
      };
