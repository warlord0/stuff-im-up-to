---
pubDatetime: 2016-11-16T22:12:05Z
modDatetime: 2016-11-17T16:03:35Z
title: "Node.js & Electron"
tags:
  - "electron"
  - "JavaScript"
  - "node.js"
  - "Web"
description: "I've run into Node.js a few times and kinda struggled with just what it's all about. I've decided to have a bit of a poke at trying to develop an applicati"
---
I've run into Node.js a few times and kinda struggled with just what it's all about. I've decided to have a bit of a poke at trying to develop an application that is cross platform and runs locally on either Windows or Linux, maybe even the fruit stuff and ran into Electron. [http://electron.atom.io/](http://electron.atom.io/) I'll confess to being completely lost as to how to even begin. Setting it up seemed confusing in the documentation. In reality it pretty much fell onto my Windows machine once I figured it out. Electron is a product delivering Node.js and the Chromium browser as a package. So put simply you write HTML, JavaScript & CSS that get delivered into a locally run browser. Node.js provides the scripting engine that has access to local resources that are accessed through the Chromium browser. Installing Electron on Windows is as simple as downloading the Node.js installer from [https://nodejs.org/en/](https://nodejs.org/en/) and running it. From a command line (PowerShell), create a project directory, call the Node Package Manager - npm and get it to download and install Electron using:

```

> mkdir c:\myproject
> cd c:\myproject
> npm install --save-dev electron-prebuilt
```

Then you can start building your app with all the coolness of Electron.

### NOTE:

    npm WARN deprecated electron-prebuilt@1.3.9: electron-prebuilt has been renamed to electron. For more details, see http://electron.atom.io/blog/2016/08/16/npm-install-electron

[http://electron.atom.io/blog/2016/08/16/npm-install-electron](http://electron.atom.io/blog/2016/08/16/npm-install-electron)
