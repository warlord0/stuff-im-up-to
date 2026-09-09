---
pubDatetime: 2017-11-29T14:38:37Z
modDatetime: 2018-02-06T08:00:39Z
title: "Google Home and Kodi"
tags:
  - "kodi"
  - "Linux"
  - "node.js"
  - "Privateer"
  - "synology"
  - "Web"
description: "I thought I'd take the opportunity to add a Google Home to my gadget collection. After all it's on a £50 off same this week, so comes in at £79 delivered."
---
I thought I'd take the opportunity to add a Google Home to my gadget collection. After all it's on a £50 off same this week, so comes in at £79 delivered. What I really want from it above all is to control my Kodi setup. Being able to voice control what movie or TV show to play would make the wife's life a lot easier - and when she's happy, I'm happy. This is where I came across the [GoogleHomeKodi](https://github.com/OmerTu/GoogleHomeKodi) project on GitHub and referenced on the Kodi forum [here](https://forum.kodi.tv/showthread.php?tid=314096). The connectivity to get Google Home to talk to Kodi is somewhat convoluted. There is no direct Google Home to Kodi link. This requires some cloud technology. Google Home talks to IFTTT, IFTTT talks to the GoogleHomeKodi service, the GoogleHomeKodi service talks to Kodi. So you need to setup an IFTTT (If This Then That) account and then install GoogleHomeKodi either onto the cloud or onto your own web server. Sounds complicated? It really isn't that bad. The developers of GoogleHomeKodi have a pretty well documented process for much of it. Instead of using the cloud install on Glitch, I chose to install the GoogleHomeKodi service onto my Synology NAS. You could install it onto pretty much anything that is capable of running Node.js including the Raspberry Pi you may have Kodi installed on. First step on the Synology is to go into the Web UI Packages app and select to install Node.js v8 \[beta\]. This will give us the command line tool needed to run the GoogleHomeKodi program. Then in the Synology Control Panel in Security open a Firewall port for 8099 so your Google Home can talk to it. You'll also want to port forward it which you can also do in the Control Panel, Router Configuration as long as your router support UPNP. ![Selection_036](/blog-media/2017/11/selection_036.png) Download and extract the GoogleHomeKodi ZIP file into an appropriate folder, I used `/volume1/code` - as this made it easier to assign permissions to run it as a service later. It'll extract into `GoogleHomeKodi-master` by default. Copy/rename and edit the config file `kodi-hosts.config.js.dist` in the `GoogleHomeKodi-master` folder so it is called `kodi-hosts.config.js`. Change the details within it to match the details of your Kodi server. Using SSH (Putty) logon to the Synology as admin and change to the `GoogleHomeKodi-master` path and install the projects dependencies.

    $ cd /volume1/code/GoogleHomeKodi-master
    $ npm install

Run the server service so you can then see it actually works when you send it instructions.

    $ node server.js
    Loaded 1 hosts from the config.js
    Starting using kodi-hosts.config.js, {"authToken":"mymadeuptoken","listenerPort":"8099","youtubeKey":"AIzaSyBYKxhPJHYUnzYcdOAv14Gmq-43_W9_79w"}
    Your app is listening on port 8099

Then you can go about setting up your IFTTT recipes to point at the Synology server:

    http://myname.synology.me:8099/[command]

Where `myname.synology.me` could be an IP address. But it makes things much easier if you've registered to use Synology's DDNS service - it's free. eg. ![Selection_035](/blog-media/2017/11/selection_035.png) If you need to test things out before you get to speaking to your Google Home you can make these calls to the API using `curl`. If you're using a Raspberry Pi with OSMC you can use it from there.

    $ curl -H "Content-Type: application/json" -X POST -d '{"token":"mymadeuptoken"}' http://myname.synology.me:8099/stop

You'll see this on the output for the SSH session  running server.js if you made a successful call. You'll then also see Kodi carry out your command (as above) if you issue something like:

    http://myname.synology.me:8099/playmovie?q=sleeping+beauty

## Running as a Service

Now you just need to make the Node.js server.js run as a service or a background process. I ensured that the proposed service account would have all the necessary permissions to run by placing the GoogleHomeKodi-master into /volume1/code and then setting the permissions using:

    $ sudo chmod 777 -Rv /volume1/code

This may be a bit more than it needs, but it'll do for now. You can tighten this up as necessary using your typical chown/chmod Linux commands. Then using the guidance from an older blog post here: [http://majikshoe.blogspot.co.uk/2014/12/starting-service-on-synology-dsm-5.html](http://majikshoe.blogspot.co.uk/2014/12/starting-service-on-synology-dsm-5.html) I created a file `/etc/init/googlehomekodi.conf` so it would start as a service.

    # only start this service after the network has started
    start on syno.network.ready
    stop on runlevel [06]

    # stop the service gracefully if the runlevel changes to 'reboot'
    stop on runlevel [06]

    # run the scripts as the 'http' user. Running as root (the default) is a bad idea.
    setuid http

    # exec the process. Use fully formed path names so that there is no reliance on $PATH
    exec /usr/local/bin/node /volume1/code/GoogleHomeKodi-master/server.js

Then to start it and ensure it stays running and stop it use:

    $ sudo start googlehomekodi
    $ sudo status googlehomekodi
    googlehomekodi start/running, process 14378
    $ sudo stop googlehomekodi

You can also look in your `/var/log/messages` to see if anything fails.

## References

[http://majikshoe.blogspot.co.uk/2014/12/starting-service-on-synology-dsm-5.html](http://majikshoe.blogspot.co.uk/2014/12/starting-service-on-synology-dsm-5.html) [https://forum.kodi.tv/showthread.php?tid=314096](https://forum.kodi.tv/showthread.php?tid=314096)
