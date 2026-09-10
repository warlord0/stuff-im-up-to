---
pubDatetime: 2024-01-16T18:48:20Z
modDatetime: 2024-03-19T18:50:53Z
title: "Cloudflare Tunnelling"
tags:
  - "cloudflare"
  - "Linux"
  - "Networking"
  - "Web"
heroImage: "/blog-media/2023/11/cloudflare.png"
description: "Using Cloudflare, it is possible to connect to a private internal service via a tunnel. This enables the interaction of a DNS name to get proxied through C"
---
Using Cloudflare, it is possible to connect to a private internal service via a tunnel. This enables the interaction of a DNS name to get proxied through Cloudflare, and over a tunnel into your secure application - without exposing the application ports to the internet.

> **REMEMBER**: Cloudflare has a free tier. Tunnelling is included.

This means none of our internal services need be published via your own public internet address, and all will be forced via Cloudflare's DNS or Load Balancing. It also means that if you are using a dynamic IP address on your server (heaven forbid) that the service will still be available regardless!

The Cloudflare documentation for this is actually very good, but I found it needed some clarity. Mostly you should follow it, and use this as a side reference to fill any gaps.

You can do some Web GUI stuff, but honestly - it's easier in Linux CLI [https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/)

## cloudflared

First thing you need to do is install the `cloudflared` application on your host. This will run as a service, connect to Cloudflare, initiate the tunnel and allow traffic into your host to its private application.

## The Brief Process

### Creating a Demo Application

create a folder `~/mytunnel`, paste in a sample `index.html` (see below), and run a python one line web server on an arbitrary port number, eg. 9080

```
mkdir mytunnel
cd mytunnel
vi index.html

<html>
  <head>
    <title>This is bogus</title>
  </head>
  <body>
    <h1>
      bogus
    </h1>
  </body>
</html>

python3 -m http.server 9080
```

Start a new terminal and leave the web service running.

### Create the Tunnel

Create the tunnel and get the UUID of the tunnel

```
sudo cloudflared tunnel create mytunnel
sudo cloudflared tunnel list

You can obtain more detailed information for each tunnel with cloudflared tunnel info <name/uuid>
ID NAME CREATED CONNECTIONS 
f8befe0e-0a52-4afb-9c7b-393b8e2b9b00 mytunnel 2024-01-16T15:44:33Z 1xlhr08, 1xlhr12, 1xman02, 1xman03
```

Create a file `/root/.cloudflared/config.yml` with the contents matching the UUID you obtained above.

```
url: http://localhost:9080
tunnel: f8befe0e-0a52-4afb-9c7b-393b8e2b9b00
credentials-file: /root/.cloudflared/f8befe0e-0a52-4afb-9c7b-393b8e2b9b00.json
```

### Create a DNS Record for the Application

```
sudo cloudflared tunnel route dns mytunnel myapplication.domain.tld
```

### Start the Tunnel

```
sudo cloudflared tunnel run mytunnel
```

You should now be able to visit [https://myapplication.domain.tld](#) and see that it gets directed to your application. The one line web server window should show some activity.

### Creating the systemd Service

```
sudo cloudflared service install
```

This creates the service and a config file in `/etc/cloudflared/config.yml`.

## Multiple Services

A single tunnel can provide for multiple services. You need only create ingress rules to allow different traffic to different services.

In this instance, the config handles traffic for `myapplication` and `myapplication1` and send them to ports 9080 and 9081 respectively. You must use "`cloudflared tunnel route dns`" to add any necessary DNS addresses to your tunnel. eg.

```
sudo cloudflared tunnel route dns mytunnel myapplication1.domain.tld
```

### /etc/cloudflared/config.yml

```
tunnel: f8befe0e-0a52-4afb-9c7b-393b8e2b9b00
credentials-file: /root/.cloudflared/f8befe0e-0a52-4afb-9c7b-393b8e2b9b00.json
ingress:
  - hostname: myapplication.domain.tld
    service: http://localhost:9080
  - hostname: myapplication1.domain.tld
    service: http://localhost:9081
  - service: http_status:404
```

The last service must exist to return a 404 on no rules being matched. Also, notice that we do not have the `url:` stanza with multiple services.

You can get clever with the rules, not just based on host name, but also path and regex's.

> Imagine this within a Docker container set! Could I run a tunnel into my container network and remain isolated from my host network?

## Using Cloudflare to Tunnel SSH

It's even possible to have Cloudflare tunnel ssh traffic for you. No more exposed port 22, but with a simple `ProxyCommand` you can connect to the internal ssh service.

By using an ingress rule like this:

```
ingress:
  - hostname: "remote.domain.tld"
    service: ssh://localhost:22
  - service: http_status:404
```

You will need to install `cloudflared` on your remote system, and then add a `ProxyCommand` into your remote ssh config:

```
Host remote.domain.tld
  ProxyCommand: cloudflared access ssh --hostname %h
```

You can then connect and be proxied into your private network, as if it were available publicly:

```
ssh user@remote.domain.tld
```

## References

[https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/get-started/create-local-tunnel/)

[https://blog.cloudflare.com/many-services-one-cloudflared/](https://blog.cloudflare.com/many-services-one-cloudflared/)

[https://orth.uk/ssh-over-cloudflare/](https://orth.uk/ssh-over-cloudflare/)

[https://www.youtube.com/watch?v=hrwoKO7LMzk](https://www.youtube.com/watch?v=hrwoKO7LMzk)
