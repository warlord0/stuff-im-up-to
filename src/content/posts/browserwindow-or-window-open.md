---
pubDatetime: 2016-12-02T17:54:16Z
modDatetime: 2016-12-02T17:56:28Z
title: "BrowserWindow or window.open"
tags:
  - "electron"
  - "JavaScript"
heroImage: "/blog-media/2016/11/electron1.png"
description: "The app I'm working on currently requires two browser windows. An initial user interface that then leads into another window once the user makes a choice."
---
The app I'm working on currently requires two browser windows. An initial user interface that then leads into another window once the user makes a choice. Typically this kind of thing would be a no brainer in html, but it gave me a few challenges as in Electron the behaviour can be quite frustrating. Initially I was simply calling `window.open(url)` in the pages JavaScript, but ran into an issue where I could end up with lots of disconnected windows. I wanted to make sure the child window was the only child window. From the Main process (`main.js`)  I can use new `BrowserWindow({options})`, but when I tried to call new BrowserWindow in the rendered html page I got an error `BrowserWindow is not a constructor`. So I had to resort to `window.open()`. Turns out this wasn't going to work for me. Calling window.open opened my required page, but in order for me to have it open in the style an manner I wanted, with the features I wanted (height, width, maximised, position) I had to use script in the rendered page. Doing this caused the newly opened window to visibly resize and move, which is most unattractive to the user. I tried using `include('electron').remote.getCurrentWindow()` and apply the sizing or window state there and still the window jigs about for the user to see. So I had to rethink my approach. If I could open a window from the Main process using BrowserWindow all would be well, just like it is for the initial window. So I decided to let Main open the window. The only thing I needed to do was talk to Main from the rendered page and have it do that for me. Good job Electron comes with the very handy IPC API. I can send an IPC message from the rendered page to the Main process and the Main process will open the new BrowserWindow for me. It also can have all my necessary window features. In my rendered html page:

``` javascript

const {ipcRenderer} = require('electron');

function LaunchReaderIpc(cbr) {
    ipcRenderer.send('LaunchReader', cbr);
}
```

and in my main.js:

``` javascript

const {
    ipcMain
} = require('electron');

ipcMain.on('LaunchReader', (args) => {
    LaunchReader(args);
});

function LaunchReader() {
    if (reader === null) {
        reader = new BrowserWindow({
            width: cfg.get('reader').width,
            height: cfg.get('reader').height,
            x: cfg.get('reader').x,
            y: cfg.get('reader').y,
            frame: true,
            resizable: true,
            icon: path.join(__dirname, 'superhero.ico')
        });
    }

    // and load the reader.html of the app.
    reader.loadURL(url.format({
        pathname: path.join(__dirname, 'reader.html'),
        protocol: 'file:',
        slashes: true
    }));

    if (cfg.get('reader').maximize) reader.maximize();

    // Open the DevTools.
    reader.webContents.openDevTools({
        detach: true
    });

    reader.on('close', () => {
        // Save settings
        if (!reader.isMaximized() && !reader.isMinimized()) {
            cfg.set('reader', {
                width: reader.getSize()[0],
                height: reader.getSize()[1],
                x: reader.getPosition()[0],
                y: reader.getPosition()[1]
            });
        }
        if (reader.isMaximized()) cfg.set('reader', {
            maximize: true
        });
    });

    // Emitted when the window is closed.
    reader.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        reader = null
    });

}
```

The important part to note in main.js being `ipcMain.on('LaunchReader'...` which gets triggered from the rendered html page by `ipcRenderer.send('LaunchReader', cbr);`
