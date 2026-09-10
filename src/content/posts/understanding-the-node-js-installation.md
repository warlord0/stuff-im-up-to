---
pubDatetime: 2016-12-03T12:42:40Z
modDatetime: 2017-03-01T14:22:25Z
title: "Understanding the Node.js Installation"
tags:
  - "JavaScript"
  - "node.js"
heroImage: "/blog-media/2016/11/images-duckduckgo-com-e1479333489433.png"
description: "I'm still a little new to this Node.js stuff and it took me a which for how it is installed to come together in my head. After carrying out the install I w"
---
I'm still a little new to this Node.js stuff and it took me a which for how it is installed to come together in my head. After carrying out the install I was confused with reading the install routines needed for various modules I wanted to make use of. I'd come across:

    $ npm install --global
    $ npm install --save-dev
    $ npm install --save

And not really understood the difference. After building an app I started to wonder why my app folder was so huge. It contained all of the node modules for everything. Surely this isn't right? So I took some time to figure out what was going on and it became obvious. When you install Node.js it installs it into your executable location, like `c:\Program Files\` and adds it to your path. So now you can just call node or npm from the command line. This comes with all the default Node.js modules. Now I want to add a module like electron-packager and I want to make it available to all future projects. So for this I use `--global`. This installs the Electron modules under an npm folder in my profife (in windows `C:\Users\Warlord\AppData\Roaming\npm\node_modules`. So now when I go create a project I can use electron-packager without having to install it into my project folder. During development I also make use of some modules that I need to have local to my project (like Gulp), but not distributed when it comes time to distribute. So for this I use `--save-dev`. This installs the modules into my profile npm/node_modules folder and adds them to the projects `package.json` under `devDependencies`. Finally I use some modules that in order for my application to work, must be distributed with it. This is where I used `--save` as it installs the modules into the projects node_modules folder and adds then to the projects `package.json` under `dependencies`.
