---
pubDatetime: 2018-10-09T19:21:24Z
title: "Opening another Window with electron-vue"
tags:
  - "electron"
  - "JavaScript"
  - "vue.js"
description: "Having entered the world of Electron and mashing it together with Vue.js using electron-vue I needed to figure out how to open another window from Electron"
---
Having entered the world of Electron and mashing it together with Vue.js using electron-vue I needed to figure out how to open another window from Electron and still have vue active within it and better yet, still have the hot module reloading active in that new window whilst developing it. It was whilst trawling the electron-vue github issue page that I came across a golden nugget of code that answered the very question for me. [https://github.com/SimulatedGREG/electron-vue/issues/401#issuecomment-330656658](https://github.com/SimulatedGREG/electron-vue/issues/401#issuecomment-330656658)

### Quoted:

First of all, you need to disable `mode: 'history'` in your vue-router, check in [vue-router docs](https://router.vuejs.org/guide/essentials/history-mode.html) Then do the following: **src/main/index.js** example

    ipc.on('showChart', function (e, data) {
      const modalPath = process.env.NODE_ENV === 'development'
        ? 'http://localhost:9080/#/showChart'
        : `file://${__dirname}/index.html#showChart`
      let win = new BrowserWindow({ width: 400, height: 320, webPreferences: {webSecurity: false} })
      win.on('close', function () { win = null })
      win.loadURL(modalPath)
    })

In your router, use the exactly path to your url **src/renderer/router.js** example

    {
      path: '/showChart',
      name: 'showChart',
      component: require('your-router'),
    },
