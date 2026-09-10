---
pubDatetime: 2019-03-27T21:51:06Z
modDatetime: 2021-10-13T15:47:01Z
title: "Scorpion Lite - ESP8266"
tags:
  - "electronics"
  - "iot"
  - "Privateer"
  - "Web"
heroImage: "/blog-media/2018/07/scorpion400.png"
description: "Looks like my friend likes to try to go one better. When he saw how I'd taken his original Wake-On-Wi-Fi idea and turned it into project Scorpion he moved"
---
Looks like my friend likes to try to go one better. When he saw how I'd taken his original Wake-On-Wi-Fi idea and turned it into project [Scorpion](https://warlord0blog.wordpress.com/2018/07/08/project-scorpion-wake-on-wifi/) he moved to using ESP8266.

At the time I started looking into using a Raspberry Pi for the project I did also look at some very lightweight alternatives using the [ESP8266](https://en.wikipedia.org/wiki/ESP8266) chip set. These are small devices perfect for use in a plethora of [IoT](https://en.wikipedia.org/wiki/Internet_of_things) projects. Their size is their strength and, for me, their weakness.

Moving onto a small chip means I have a few issues to solve that the Raspberry solves easily. 1) Power supply 2) File storage 3) My skills.

![](/blog-media/2019/03/20190324_142424_hdr.jpg)

Adafruit Huzzah and FTDI Cable

Something I already had in my box of wires and gadgets is an [Adafruit Huzzah ESP8266](https://www.adafruit.com/product/2471) board. I bought it a while ago and needed to combine it with a few other bits to make it work. To program it I needed a [USB FTDI](https://en.wikipedia.org/wiki/FTDI) cable - which I also have.

But then my friend discovered the [Wemos D1 Mini](https://wiki.wemos.cc/products:d1:d1_mini) - now re-branded Lolin. The big benefit here is that it solves problem \#1 (power supply) and means I don't need an FTDI cable, just a regular micro USB cable which also supplies power.

Wemos also have a relay "shield" that means I can create a tidy package that builds in the ESP8266 and includes the relay required to turn on the PC.

### Arduino IDE

To program the ESP8266 on the Wemos or the Huzzah you can use the Arduino IDE. This allows you to write the code, compile and upload it to the ESP chip.

Problem \#3 (My skills) means I need to learn some Arduino (C/C++). Thankfully this is not too significantly different (syntactically) to other languages I use. Many of the ESP examples are pretty straight forward to follow.

As this was very new to me, and still is. The thing I tripped over was not knowing how to put the ESP into the mode that would allow me to upload my code to it.

On the Huzzah you press and hold the GPIO0 button (the red LED illuminates) and press and release the Reset button (the blue LED illuminates briefly) and then the red LED stays dimly illuminated. Now you can upload your code and the blue LED flickers as Arduino uploads your code.

![](/blog-media/2019/03/20190326_171432_hdr.jpg)

Lolin Wemos D1 Mini and Relay

On the Wemos D1 mini it's even easier to upload to. It comes with a ready made USB mini socket for power and acts as a serial UART to talk to the ESP and it's always ready for upload. You just set the Arduino IDE to use the NodeMCU 0.9 (ESP12) and select upload. Nothing to do on the board at all.

I bought the Wemos D1 Mini and relay from UK supplier eBay for under tenner and they arrived next day.

Once uploaded I enable the serial monitor using CTRL+SHIFT+M. This lets you see any debug serial output you have called in your code.

### WebSockets

I wanted to replicate the Raspberry capabilities as much as possible. It's a simple HTML page with an Ajax submission for toggling the on/off function. But I also use websockets to inform the client front end that the state of the PC has changed from on to off, or off to on.

Websockets seemed only to sit as a server feature when it ran on it's own TCP port. This isn't what I wanted. I want to use websockets on the same TCP port as my HTTP web service. eg. TCP port 3000 for both.

Then I found [ESPAsyncWebServer](https://github.com/me-no-dev/ESPAsyncWebServer).

In order to use it you need to install it and it's dependency [ESPAsyncTCP](https://github.com/me-no-dev/ESPAsyncTCP) as a library into Arduino. It's easier than it sounds, and certainly easier than all the PlatformIO stuff in the documentation. Download both of the Github projects as a Zip file. Then in the Arduino IDE, from the menu choose Sketch, Include Library, Add .ZIP Library...

Repeat this in turn for each of the downloaded Zip files. Then they can be referenced as `#includes` in your code.

### File System Driver

To solve my problem \#2 (File storage), the ESP can also hold files using a file system called [SPIFFS](https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/storage/spiffs.html), but you need to add a plugin into the Arduino IDE to support uploading them.

Download the Zip file from the Github project [arduino-esp8266fs-plugin](https://github.com/esp8266/arduino-esp8266fs-plugin/releases/tag/0.2.0). Then extract the files into your Arduino program directory - usually `C:\Program Files (x86)\Arduino\tools`. Restart the Arduio IDE and you'll find a new option on the Tools menu for "ESP8266 Sketch Data Upload".

*You need to put the ESP into upload mode as for above.*

In your arduino project create a folder called `data` and that's where you place the files you want to transfer into your [SPIFFS](https://docs.espressif.com/projects/esp-idf/en/latest/api-reference/storage/spiffs.html) storage. For my project that includes HTML, CSS and JavaScript files for the web page to be served from.

### ESPAsyncWebServer and GZip Compression

One of the other really cool things about the ESPAsyncWebServer is how it is used to serve files from the SPIFFS storage. As the ESP is limited to 1MB, 2MB or 4MB of storage - dependent on the model you bought, keeping the size of your assets down is crucial.

I spent a while trying to figure out how to use [GZip](https://www.gnu.org/software/gzip/) to compress my assets and then serve them through the web server compressed. Eventually I discovered I wasted a bunch of time as the web server does this by itself! I have no need to do anything other than compress my assets to `.gz` files.

If I use something like [7-Zip](https://www.7-zip.org/) I can compress each asset file eg. `metro4-all.min.css` to `metro4-all.min.css.gz` and remove the uncompressed version. Then in my HTML page I still refer to it as the non-gz version. The web server then picks up the `.gz` version and adds the necessary gzip header and sends it to the client.

This means my asset storage becomes as small as possible. The minified `.css` file actually became a tenth of it's uncompressed size! Obviously your milage will vary based on how compressible your assets are, eg. .png files are pretty much as small as they get so there's no point GZipping them, but anything text based like `.js` and `.css` are ripe for compressing.

It's not a finished project yet. I've got the main features up and running, web server serving the page, websockets connecting client and server and the API Json call getting sent over Ajax/XHR.

> There's still a few challenges to finalise. In particular the part where I check the host is powered on by seeing if a TCP port is open. I have yet to find an Arduino solution similar to [tcp-ping](https://www.npmjs.com/package/tcp-ping). But in the main the code does what I need it to do. Once I have it assembled I'll post it up onto Github.

### References

A Beginner's Guide to the ESP8266 <https://tttapa.github.io/ESP8266/Chap01%20-%20ESP8266.html>
