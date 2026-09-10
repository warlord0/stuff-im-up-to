---
pubDatetime: 2018-08-30T19:56:41Z
modDatetime: 2018-08-31T13:03:20Z
title: "VOF - Accessing H2 from Another System"
tags:
  - "Linux"
heroImage: "/blog-media/2018/08/lagan_logo.png"
description: "Following on from Verint Online Forms using H2 seems pretty straight forward locally. It fires up a web server and you can manage the H2 database straight"
---
Following on from [Verint Online Forms](https://warlord0blog.wordpress.com/2018/08/30/verint-online-forms/) using H2 seems pretty straight forward locally. It fires up a web server and you can manage the H2 database straight from there. You need the VOF database details you put into `Config.sh` then you can start connecting to it from within the browser. eg.

    JDBC URL: jdbc:h2:~/lagan/dform-x.x.x/db/kana-integration/h2

But if you're running dforms on your virtual box development server you'll be denied because the setting `webAllowOthers` is not set.\* This is easily remedied and still secure as your virtual box should be using a "host only network adapter" so only your system can get to it. Create a file in you home folder and put the following one line into it:

    $ vi ~/.h2.server.properties

    webAllowOthers=true

That's all. Once the server runs it will probably add some more to the file, but you should now be able to access the H2 GUI at [http://192.168.56.2:8082](http://192.168.56.2:8082) The other thing that may be stopping you is by default H2 will look at your systems name and resolve it to an IP. This is the IP that will listen on port 8082. If you've setup a virtual box then your `/etc/hosts` file may contain a line like `127.0.1.1 debian` and this will be an inaccessible IP. You'll need to change this so you have an entry matching your machines DNS name eg.

    192.168.56.2    debian debian.domain.local

When you start H2 you should then see it listen on the correct address.

    $ sh ./h2.sh
    Failed to start a browser to open the URL http://192.168.56.2:8082: Browser detection failed and system property h2.browser not set

Don't worry about the error. It's complaining because we're running a headless non-Windowed server, there is no X11 and there is no browser to launch. The important thing is it's starting on the right IP address.

## Other Useful Options

By default H2 tries to start a browser as shown in the above error message. You can stop this behaviour by passing parameters to the `h2.sh` call

> -web - start a web service -tcp - start a tcp service -pg - start a postgres service -browser - try and start a browser

So if you just want a web service

    $ sh ./h2.sh -web

    Web Console server running at http://192.168.56.2:8082 (others can connect)

No more error message! You can chain them too eg. `sh ./h2.sh -web -tcp -pg` or for a more permanent solution edit the `h2.sh` file and add `-web` to the java line:

    java -cp "$dir/h2-1.4.197.jar:$H2DRIVERS:$CLASSPATH" org.h2.tools.Console "$@" -web

 

> \* Yes I know you can set this in the Web GUI. But if you can't get to the Web GUI (the whole point of this article) you'll need to set it from the servers command line.
