---
pubDatetime: 2018-07-18T20:59:17Z
modDatetime: 2018-08-01T19:14:04Z
title: "vue-cli 3 and hmr"
tags:
  - "JavaScript"
  - "node.js"
  - "vue.js"
  - "Web"
  - "webpack"
description: "Using vue.js 3 with Hot Module Reload from a different server than the development environment runs on."
---
What a nightmare I've had. Trying to figure out how to run a dev server with HMR (Hot Module Reload) on a virtual host that has two interfaces - one NAT and one Host Only adapter! Why the two interfaces? Well I have to NAT one out from the guest OS so traffic looks like it comes from my business PC that uses network authentication. But NAT means I have no access back to the dev server as it uses an ip of 10.0.2.15 (typical virtual box behaviour). So to gain access to the dev server from my host I then use another NIC in the virtual guest that uses the "Host Only Adapter". So this ends up using a static IP address of 192.168.56.2 - again typical virtual box behaviour. So I can access the virtual guest as http://192.168.56.2:8080 to connect to the webpack dev server, but then I see errors in the client browser console:

    + [HMR] Waiting for update signal from WDS
    + [WDS] Disconnected

When I expanded the `[WDS] Disconnected` message I could see the clue being:

    ./node_modules/webpack-dev-server/client/index.js?http://10.0.2.15:8080/sockjs-node

It's obviously telling my client to use the wrong network interface for the websockets/sockjs connection used by HMR. How to fix it was a mystery. I had to trawl until I found the `@vue\cli-service\lib\serve.js` file. In here it starts the sockjs with options like this:

    const publicOpt = projectDevServerOptions.public
    const sockjsUrl = publicOpt ? `//${publicOpt}/sockjs-node` : url.format({
      protocol,
      port,
      hostname: urls.lanUrlForConfig || 'localhost',
      pathname: '/sockjs-node'
    })

This meant I could look to the `vue-config.js`​ file in the root of my project ad set the 'public' variable accordingly. I also set the proxy option to handle the fact I'm not developing on the same server.

    // vue.config.js
    module.exports = {
      devServer: {
        useLocalIp: false,
        proxy: 'http://localhost:8080',
        public: '192.168.56.2:8080',
      }
    }

Then I started the dev server using yarn, I could also use npm I guess.

    $ yarn serve
    ...
    DONE Compiled successfully in 1002ms 21:39:53

      App running at: 
      - Local: http://localhost:8080/ 
      - Network: http://10.0.2.15:8080/

Now when I edit code and webpack recompiles, the HMR works and the browser updates!
