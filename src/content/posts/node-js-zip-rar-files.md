---
pubDatetime: 2016-12-07T16:22:40Z
modDatetime: 2016-12-07T16:25:33Z
title: "Node.js, Zip & RAR files"
tags:
  - "JavaScript"
  - "node.js"
  - "Privateer"
description: "What an excursion this turned out to be. I figured using 7-zip would be the panacea for compressed files. How wrong could I be? Turns out that the node-7z"
---
What an excursion this turned out to be. I figured using 7-zip would be the panacea for compressed files. How wrong could I be? Turns out that the node-7z module is restricted to only being able to use the 7-zip v9 series. Any of the newer v15 and above don't work. This is simply because node-7z uses the stdout from the 7z processes to get the list of extracted files. The newer 7z doesn't report the extracting progress in the same way. That's not the only problem. If I want truly cross platform I have to use programs that are available on those platforms. So on Linux I have to rely on `p7zip` or `p7zip-full` to handle my archives. These are only compatible with 7-zip v9, so that should be fine right? Well, no, that's not where the problems happen. 7-zip v9 doesn't support the newer RAR formats. So many of the RAR files I'm trying to extract don't get extracted, because 7-zip can't read them. This leaves me with having to use the `unrar` program by calling it from the shell in the same way as `7z`. Not the end of the world. But the Node modules `node-7z` and `unrar` are very different so I've had to resort to writing different code to extract different files. One big gotcha on the unrar was making sure I tidied up any temporary files. In particular I'd find not using events for the on end and on closed would result in a directory not empty error message because the stream was still in use.

    cbr.list((err, entries) => {
        entries.sort((a, b) => { // Sort the entries by name
            if (path.basename(a.name)  {
            //console.error(err);
            throw err;
        });
        stream.on('end', () => { // This happens async so we can only offer an event trigger
            makeCover(cbrFile, filehash, path.join(tmpPath, path.basename(entries[0].name)));
        });
        var writeable = require('fs').createWriteStream(path.join(tmpPath, path.basename(entries[0].name)))
        writeable.on('close', () => { // Ensure we tidy up after the file is closed
            cleanupCallback();
        })
        stream.pipe(writeable);
    });
