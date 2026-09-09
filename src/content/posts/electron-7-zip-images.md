---
pubDatetime: 2016-11-25T21:33:20Z
modDatetime: 2016-11-25T21:38:09Z
title: "Electron, 7-zip & Images"
tags:
  - "JavaScript"
  - "Privateer"
description: "The app I'm trying to create reads image files from a compressed file. either a zip, a rar or 7-zip format. The aim is to then extract the first image from"
---
The app I'm trying to create reads image files from a compressed file. either a zip, a rar or 7-zip format. The aim is to then extract the first image from the file and use that to make a thumbnail that can be displayed in an electron browser page. Sounds easy? But I've been through lot's of different uncompress/decompress libraries from the npm package manager and none of them have really fitted the bill. In fact the current choice I see as a bit of a compromise. To make the app truly cross platform I was hoping for a self contained library that ran the decompression algorithms natively within Node.js/Javascript. There are a few out there, many for handling zip files, but when it comes to rar the perfomance and capabilities are really lacking. The answer? Use a wrapper to call an external command. Having to do this I decided why end up with 3 programs to handle zip, rar and 7-zip when 7-zip will cater for all. This means I have to have the 7z executable in my PATH or my electron app will fail. It's a sacrifice I'll have to live with for now. So in installed node-7z:

    $ npm install node-7z

This is a snippet of the routine I've written to handle the processing of the file. It extract the first image, resizes it to 160px wide, converts it to a png and saves it as `testfile.png`

``` javascript

var n7z = require('node-7z'),
    files = [], // The array of compressed files
    cbr = new n7z();

cbr.list(file) // First lets get the first image file from the compressed file
    .progress(function(zfiles) {
        zfiles.forEach(function(zfile) { // Populate the array of compressed files
            if ('.jpg.jpeg.gif.png'.indexOf(path.extname(zfile.name)) != -1) {
                files.push(zfile.name);
            }
        });
    })
    .then(function(spec) { // Now we have finished the list extract the files
        cbr.extract(file, path.join(__dirname, 'temp'),
                { wildcards: files[0] } // we only want the first file
            )
            .then(function() { // After it's extracted let's resize it to make a cover thumbnail                                
                const nativeImage = require('electron').nativeImage,
                    fs = require('fs');
                var coverImg = nativeImage.createFromPath(path.join(__dirname, 'temp', files[0])), // Load the image
                    buffer = coverImg.resize({width: 160}); // Specify only a width and height is calculated from aspect ratio

                // Save the buffer to a file as a png (.toPng) format
                fs.writeFile(path.join(__dirname, 'temp', 'testfile.png'), buffer.toPng(),
                    function(err) {
                        console.error(err);
                    }
                )
            })
            .catch(function(err) {
                console.error(err);
            });
    })
    .catch(function(err) {
        console.error(err);
    });
```
