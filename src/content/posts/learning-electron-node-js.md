---
pubDatetime: 2016-11-29T09:00:47Z
modDatetime: 2016-11-29T09:36:11Z
title: "Learning Electron & Node.js"
tags:
  - "electron"
  - "JavaScript"
  - "node.js"
  - "Privateer"
heroImage: "/blog-media/2016/11/screenshot-from-2016-11-29-083649.png"
description: "Many years ago in a galaxy far, far away I developed an application to manage and read my comic books. I developed it in a Windows environment and used C#"
---
Many years ago in a galaxy far, far away I developed an application to manage and read my comic books. I developed it in a Windows environment and used C# Dot Net to build it. It worked just great and I still use it today. It's actually one of the things I use that prevents me from going full Linux on my home desktop. So I decided I'd see if I could remedy that by replacing it with a cross platform solution using [Electron](http://electron.atom.io). If nothing else it would provide me with an opportunity to learn how to use Electron & Node.js It's an interesting experience learning something new. Something that has so many differences to approaches I've used before. Generally processing power and threading have never really been an issue. With Electron things become quite different when you move into a product that uses a single thread per process. Everything seems to rely on 'callbacks'. You start an asynchronous process and then specify the callback to use, whilst carrying on with the process you're currently in. Then waiting for the callback to be called - before you get any value from the function you called.

- Not everything is asynchronous, but it makes sense to go async when you can, but handle the callbacks responsibly.

By way of an example a simple call to a directory listing can be done as async or sync. If you call is synchronously you'll get a variable populated with your file objects:

    var myfiles = fs.readdirSync(folder);

Seems pretty straight forward. But if you're processing the files somehow and there's a lot of them you'd be waiting on the synchronous process before you can continue. If you're in a hurry to show a graphic interface to the user then there's not need to wait.

``` javascript

fs.readdir(folder, function(err, myfiles) {
  if (err) {
    throw err;
  }
  myfiles.forEach(function(file) {
    console.log(file);
  }
});

console.log('Got here!');
```

Depending on the number of files in the folder you'll probably see the `Got here!` message in the browser log before it's finished listing all the files. Now if you're opening the file to read from it within the callback, you also have to be careful about closing it. Quite often you'll open a file using an async method and have to close it within the callback, not after the calling function. If you try to close it after the calling function you could find that the callback process is still using it. So be careful here. A good example of this is in my snippet here. Basically I create a temporary folder, extract a file into it, but have to make sure I call the cleanUpCallback() within the callback process. Doing it after the `tmpDir` call fails to run as by that time we've exited the tmpDir process, but it's still running the callback to extract files.

``` javascript

var tmp = require('tmp'); // Create a unique temp dir because we dont want clashing async filenames
tmpDir = tmp.dir({
    prefix: 'tmp_',
    dir: path.join(__dirname, 'temp'),
    unsafeCleanup: true
}, function _tempDirCreated(err, tmpPath, cleanupCallback) {
    if (err) throw err;
    files.sort(); // Sort the file array as they may not be stored in order
    cbr.extract(file, tmpPath,
            {
                wildcards: files[0]
            } // we only want the first file
        )
        .then(function() { // After its extracted lets resize it to make a cover thumbnail
            coverImg = nativeImage.createFromPath(path.join(tmpPath, files[0])); // Load the image
            var buffer = coverImg.resize({
                width: 160
            }); // Specify only a width and height is calculated from aspect ratio

            // Save the buffer to a file as a png (.toPng) format
            fs.writeFile(path.join(__dirname, 'temp', path.basename(file) + '.png'), buffer.toPng(),
                function(err) {
                    if (err) {
                        console.error(err);
                    } else {
                        cleanupCallback(); // Now the files writted cleanup the temp dir
                        eventEmitter.emit('cover', [buffer, path.basename(file) + '.png']); // Trigger the cover event
                    }
                }
            )
        })
        .catch(function(err) {
            console.error(err);
        });
});

// To early to clean up the temp folder here!
```
