---
pubDatetime: 2018-06-27T18:59:27Z
modDatetime: 2018-06-27T19:04:40Z
title: "Node.js v8 on Raspberry Pi Zero"
tags:
  - "JavaScript"
  - "Linux"
  - "node.js"
  - "Privateer"
  - "raspberry pi"
heroImage: "/blog-media/2016/11/images-duckduckgo-com-e1479333489433.png"
description: "With Raspbian on my Zero I only get Node v4 in the repository. So How do I get a newer version of Node.js? If I follow the standard Node instruction for in"
---
With Raspbian on my Zero I only get Node v4 in the repository. So How do I get a newer version of Node.js? If I follow the standard Node instruction for installing from a repository I get:

    $ curl -sL https://deb.nodesource.com/setup_8.x | sudo -E bash -

    ## Installing the NodeSource Node.js 8.x LTS Carbon repo...

    ## You appear to be running on ARMv6 hardware. Unfortunately this is not currently supported by the NodeSource Linux distributions. Please use the 'linux-armv6l' binary tarballs available directly from nodejs.org for Node.js 4 and later.

So it looks like I must download the `tar.xz` file. You can get the file either directly from the [download page](https://nodejs.org/en/download/) using the link for **armv6** and scp it onto the pi or copy the link and paste it into the wget on the pi.

    $ cd
    $ wget https://nodejs.org/dist/v8.11.3/node-v8.11.3-linux-armv6l.tar.xz
    $ tar -xvf node-v8.11.3-linux-armv6l.tar.xz
    $ cd node-v8.11.3-linux-armv6l
    $ sudo cp -R * /usr/local/

Then because all this is copied into the path `/usr/local` the node executable is in the `/usr/local/bin` folder, which is in your path `node` should run happily.

    $ node -v
    v8.11.3

  **References:** [http://thisdavej.com/upgrading-to-more-recent-versions-of-node-js-on-the-raspberry-pi/#comment-3702](http://thisdavej.com/upgrading-to-more-recent-versions-of-node-js-on-the-raspberry-pi/#comment-3702)
