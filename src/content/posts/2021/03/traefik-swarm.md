---
pubDatetime: 2021-03-17T14:56:46Z
modDatetime: 2021-03-22T20:55:49Z
title: "Traefik Swarm"
tags:
  - "Docker"
  - "Linux"
  - "nginx"
  - "swarm"
  - "traefik"
heroImage: "/blog-media/2021/03/traefik_logo.png"
description: "Traefik is a reverse proxy that is configured directly from your docker configuration."
---
Some time ago I looked at traefik. It looked a really good idea, but for the life of me I couldn't get it working. I gave up and moved on. Now I have another project that this would be suited to, it's time to revisit it. It proved just as tricky as before only this time I wasn't giving up.

Traefik is a reverse proxy that is configured directly from your docker configuration. Usually I'd build an `nginx.conf` after I've deployed a container and point it at the services being provided. Traefik changes that. You configure the traefik reverse proxy by adding labels to your container set (service) and traefik reads the setup from your `/var/run/docker.sock` and creates the reverse proxy for you.

I started with the basic whoami example and had to make some changes to the way it's documented and the way I understood it to work.

Firstly I [built my swarm](/posts/docker-swarm/).

Because all the services I'm building are isolated from each other in terms of networking I need to create a network in my swarm. You can do this in portainer or by command line. But I need to do this before I can deploy traefik as I'm using this network in my traefik compose below.

```
docker network create --driver overlay --attachable whoami
```

I then deployed traefik as a stack into my swam using the compose:

```
version: '3'

services:
  reverse-proxy:
    # The official v2 Traefik docker image
    image: traefik:v2.4
    # Enables the web UI and tells Traefik to listen to docker
    command: --api.insecure=true --providers.docker --providers.docker.swarmMode=true --accesslog=true --log.level=DEBUG --log.format=json
    network_mode: host
    ports:
      # The HTTP port
      - "80:80"
      # The Web UI (enabled by --api.insecure=true)
      - "8080:8080"
    volumes:
      # So that Traefik can listen to the Docker events
      - /var/run/docker.sock:/var/run/docker.sock
    deploy:
      labels:
        traefik.enable: "False"
      placement:
        constraints:
          - node.role == manager
    networks:
      - whoami
          
networks:
  whoami:
    external: true
```

This enables swarm mode and sets the logging to debug so I can see what's going on with my deployment. I should step this back from debug once I get things working.

Now for my `whoami` stack. I had to add a series of labels for traefik to read from. They must be in the `deploy:` stanza when you use it within a swarm.

```
version: '3.2'

services:
  whoami:
    image: containous/whoami
    deploy:
      replicas: 3
      labels:
        traefik.enable: "True"
        traefik.http.routers.whoami.rule: Host(`whoami`)
        traefik.http.routers.whoami.entrypoints: http
        traefik.http.services.whoami.loadbalancer.server.port: 80
    networks:
      - whoami
      
networks:
  whoami:
    external: true
```

After I bring the service up it should scale to all 3 of my swarm nodes, because of the `replicas: 3` option.

The way this should work is we have told traefik that when we see a host header of `whoami` come in to the `http` endpoint to route the traffic to port `80` of this container. But notice I have not exposed any ports as I would with a stand-alone compose. There is no need to. As long as the service is configured to listen on the port I've told traefik to use with `loadbalancer.server.port: 80` then the routing will work.

If you look at the traefik web gui on [http://swarm1:9000](#) you should see it automatically appears in there as a router, and service.

Test it with curl:

```
$ curl -H Host:whoami http://swarm1
Hostname: d409518f8b22
IP: 127.0.0.1
IP: 10.99.99.10
IP: 172.18.0.3
RemoteAddr: 10.99.99.3:57982
GET / HTTP/1.1
Host: whoami
User-Agent: curl/7.75.0
Accept: */*
Accept-Encoding: gzip
X-Forwarded-For: 10.0.0.2
X-Forwarded-Host: whoami
X-Forwarded-Port: 80
X-Forwarded-Proto: http
X-Forwarded-Server: 96cd10a2ff33
X-Real-Ip: 10.0.0.2
```

It doesn't matter if you point at swarm1, 2 or 3 the load balancer will handle the request.

## Previously What Was I Doing Wrong?

There are some really good gotchas in this. Look at the compose for BOTH services, traefik and whoami - both have the network `whoami` configured. Without this traefik has no access to the `whoami` service and can't route to it. I have to define all networks I use for my services to also be used by traefik. If you only have one host network this is easy, but because I'm using many I must add each of the networks to the traefik compose file.

You also need to read the examples very carefully. Did you notice the \\ back ticks around the host name in the rule? Those aren't single quotes. You also can't use double quotes.

By doing some debugging with the logs you can see when packets hit the traefik router. This is how I determined that at least it was recognising my host header and trying to direct it to the correct service. It was this that helped me identify that I needed to add every host network into the traefik compose. Without it there is no route from traefik to your server. It sounds obvious when you type it out, but it was clearly something big I'd missed.

Seeing this in the log means I know traffic is handling the host header:

```
{"Request":"{\"Method\":\"GET\",\"URL\":{\"Scheme\":\"\",\"Opaque\":\"\",\"User\":null,\"Host\":\"\",\"Path\":\"/\",\"RawPath\":\"\",\"ForceQuery\":false,\"RawQuery\":\"\",\"Fragment\":\"\",\"RawFragment\":\"\"},\"Proto\":\"HTTP/1.1\",\"ProtoMajor\":1,\"ProtoMinor\":1,\"Header\":{\"Accept\":[\"*/*\"],\"User-Agent\":[\"curl/7.75.0\"],\"X-Forwarded-Host\":[\"whoami\"],\"X-Forwarded-Port\":[\"80\"],\"X-Forwarded-Proto\":[\"http\"],\"X-Forwarded-Server\":[\"52efe4463e05\"],\"X-Real-Ip\":[\"10.0.0.2\"]},\"ContentLength\":0,\"TransferEncoding\":null,\"Host\":\"whoami\",\"Form\":null,\"PostForm\":null,\"MultipartForm\":null,\"Trailer\":null,\"RemoteAddr\":\"10.0.0.2:38348\",\"RequestURI\":\"/\",\"TLS\":null}","level":"debug","msg":"vulcand/oxy/roundrobin/rr: begin ServeHttp on request","time":"2021-03-17T11:39:32Z"}

{"ForwardURL":{"Scheme":"http","Opaque":"","User":null,"Host":"10.99.99.12:80","Path":"","RawPath":"","ForceQuery":false,"RawQuery":"","Fragment":"","RawFragment":""},"Request":"{\"Method\":\"GET\",\"URL\":{\"Scheme\":\"\",\"Opaque\":\"\",\"User\":null,\"Host\":\"\",\"Path\":\"/\",\"RawPath\":\"\",\"ForceQuery\":false,\"RawQuery\":\"\",\"Fragment\":\"\",\"RawFragment\":\"\"},\"Proto\":\"HTTP/1.1\",\"ProtoMajor\":1,\"ProtoMinor\":1,\"Header\":{\"Accept\":[\"*/*\"],\"User-Agent\":[\"curl/7.75.0\"],\"X-Forwarded-Host\":[\"whoami\"],\"X-Forwarded-Port\":[\"80\"],\"X-Forwarded-Proto\":[\"http\"],\"X-Forwarded-Server\":[\"52efe4463e05\"],\"X-Real-Ip\":[\"10.0.0.2\"]},\"ContentLength\":0,\"TransferEncoding\":null,\"Host\":\"whoami\",\"Form\":null,\"PostForm\":null,\"MultipartForm\":null,\"Trailer\":null,\"RemoteAddr\":\"10.0.0.2:38348\",\"RequestURI\":\"/\",\"TLS\":null}","level":"debug","msg":"vulcand/oxy/roundrobin/rr: Forwarding this request to URL","time":"2021-03-17T11:39:32Z"}
```

## Thinking About Production

As I developed my test lab I started thinking about what happens when I need to add a network to the traefik compose when I can't afford down-time. I need to scaled my traefik service out to at least two replicas to ensure whilst one is updating the other is still serving. The problem here is that you can only deploy traefik to manager nodes. In a production environment it is recommended to run at least three manager nodes for fault tolerance. In which case I should probably have three replicas of traefik too.

Promote the nodes to become a manager:

```
docker node promote swarm2
docker node promote swarm2
```

Then I can change the traefik compose deploy stanza:

```
    deploy:
      replicas: 3
      update_config:
        parallelism: 1
        delay: 15s
      labels:
        traefik.enable: "False"
      placement:
        constraints:
          - node.role == manager
```

### A Rethink About Traefik Replicas

It turns out the community edition has a limited capability when it comes to TLS termination. This means each replica does not co-ordinate or share the certificates - that's an Enterprise feature. So with that said if i must only use one traefik container I need to ensure that it stays up during updates.

To achieve this you need to be using version 18.06.0 of Docker, that supports compose version 3.7, as that has an `order:` stanza that stops the old container stopping before the new one is ready.

```
    deploy:
      replicas: 1
      update_config:
        parallelism: 1
        delay: 15s
        order: start-first
```

It is only available with Docker Engine version **18.06.0** and higher.

## References

[https://blog.container-solutions.com/rolling-updates-with-docker-swarm](https://blog.container-solutions.com/rolling-updates-with-docker-swarm)
