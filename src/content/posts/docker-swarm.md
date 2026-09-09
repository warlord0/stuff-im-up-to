---
pubDatetime: 2021-03-14T13:06:10Z
modDatetime: 2021-03-14T13:25:34Z
title: "Docker Swarm"
tags:
  - "Docker"
  - "Linux"
  - "swarm"
description: "It's time to look at building replicated services using Docker swarm. Mostly I build lots of docker compose configs, but not had the need to create an auto"
---
It's time to look at building replicated services using Docker swarm. Mostly I build lots of docker compose configs, but not had the need to create an automated resilient solution until now.

Docker already comes ready to swarm. The instructions to get it setup are very straight forward. You just have to initialise the master and then have other nodes join.

[https://docs.docker.com/engine/swarm/swarm-tutorial/](https://docs.docker.com/engine/swarm/swarm-tutorial/)

Do some testing with a three node virtual machine setup where there are 3 vm's called smarm1, swarm2 and swarm3. All of them have Docker and docker-compose installed. Setup you shh keys to allow you to talk to them all and in this case I'm using swarm1 as the master node.

```
ssh swarm1 docker swarm init --advertise-add=192.168.122.1
```

This gives you the command to use to sign up the other nodes to this master.

```
docker swarm join \
    --token SWMTKN-1-49nj1cmql0jkz5s954yi3oex3nedyz0fb0xx14ie39trti4wxv-8vxv8rssmk743ojnwacrr2e7c \
    192.168.122.1:2377
```

Sign up the other two nodes:

```
ssh swarm2 docker swarm join \
    --token SWMTKN-1-49nj1cmql0jkz5s954yi3oex3nedyz0fb0xx14ie39trti4wxv-8vxv8rssmk743ojnwacrr2e7c \
    192.168.99.1:2377
ssh swarm3 docker swarm join \
    --token SWMTKN-1-49nj1cmql0jkz5s954yi3oex3nedyz0fb0xx14ie39trti4wxv-8vxv8rssmk743ojnwacrr2e7c \
    192.168.122.1:2377
```

Next you could continue the tutorial and deploy a service to the node, but I'm going to skip ahead and assume we have a working 3 node cluster and we're going to install portainer onto the master to manage it.

[https://documentation.portainer.io/v2.0/deploy/ceinstallswarm/](https://documentation.portainer.io/v2.0/deploy/ceinstallswarm/)

Very easy to get portainer installed onto the master as part of the swarm:

```
ssh swarm1 curl -L https://downloads.portainer.io/portainer-agent-stack.yml -o portainer-agent-stack.yml
ssh swarm1 docker stack deploy -c portainer-agent-stack.yml portainer
```

That's it! Now we can go to the management GUI [http://swarm1:9000](#). First visit you get to create the admin username and password you need to remember for future sessions.

The clever bits of the portainer install ensure that the management piece only runs on master nodes and that every node gets an agent automatically installed. There really is very little to do to get it up and running.

## Some Caveats

If you're going to deploy to the swarm you're going to need to make sure they all have access to the same materials and folder structures. Later I'll be going over using shared storage and repositories, but right now you need to make sure that any volumes in your compose files are available on every node along with any images you require.

You cannot use docker-compose to build images. They must be built and tagged on each node in order to be available. If you have a `build:` directive in the compose file you need to change to `image:` and actually build it so it's in the local cache.

### Asset Replication

If you have a limited number of nodes in your swarm then you can use replication between the nodes to keep the filesystem consistent so when a container stars on another node it has access to the same resources. If you don't have the same assets in the same structure the node can't start the container. This is where using a shared filesystem comes to the fore.

#### Using NFS

I setup another server to provide NFS shares for the shared assets. This means a change to the `docker-compose.yml` so we can connect to the NFS volumes.

On my NFS server I edited the `/etc/exports` file and refresh the NFS service:

```
/srv/nfs-volumes/S001/etc *(rw,sync,no_subtree_check,no_root_squash)
```

You also need to ensure you use the same permissions as you would if it were used in a local compose file and `chmod`/`chown` as necessary. You may also want to tighten up on the `*` for security.

Then in my `docker-compose.yml` that I'm going to deploy to the swarm I need to create a `volumes` stanza and specify how to connect and use my NFS volume.

```
volumes:
  etc:
    driver: local
    driver_opts:
      device: :/srv/nfs-volumes/S001/etc
      o: addr=nfs-server,rw,noatime,rsize=8192,wsize=8192,tcp,timeo=14
```

Now when I use this volume in a service I just refer to it by name:

```
services:
  myservice:
    ...
    volumes:
    - etc:/etc/myservice:rw
```

This is great for using file type assets, but not really suited for database storage due to file locking requirements. This means I also need to consider how we provide databases to these containers. I need a consistent approach and that for now means keeping my databases on a Linux filesystem (like ext4). So for now I'm moving the databases out of the application compose and into a separate server.

I can still use a docker compose for that, but I'm not going to use swarm because I need to ensure it is not migratory. You can use rules to bind a service to a node(like how it's done with portainer), but for now let's assume our databases are on a separate server.

## Deploying Your Compose

Starting out you'll be best either uploading your compose file or using the web editor to paste it it. I started with the web editor because this will syntax check it before it builds the containers. This certainly helped because first you need to ensure you are using at least version 3 in your file, but also the `depends_on:` stanza needed changing in my case.

I build a template style of my compose file and then used it to output the `docker-compose.yml` file I was going to use. This created a `depends_on:` stanza that looked like this:

```
    depends_on:
      db:
        condition: service_started
```

Portainer doesn't like this and I had to change it to:

```
    depends_on:
      - db
```

Once the syntax check is successful portainer deploys the stack and brings up the services and containers.

At this point you'll need to go looking at logs for the containers that you built to ensure they came up as expected.

### Using Github

Once happy the containers work then you can move onto hosting you docker-compose on github and have it pull the data from the repo. I moved to this style of deploy last because I knew it would have some things I needed to configure first. When you create the token, copy it and put it into your favourite password manager, as this is the last time you will ever see it.

With my github account I had to go in to the developer settings and create a personal access token that has access to my private repositories. Then when deploying my stack in portainer I use the newly created credentials. The quirks I encountered doing this were that the repository URL is not the https from the code link in github, it is just the repository address (so take the .git extension off the code link).

It's only interested in the file `docker-compose.yml` - change the file name if you use something different. You also need to put in any environment variables if you use them in your compose.

> Currently the github option is only a one time deal at creation anyway. There is an [open ticket](https://github.com/portainer/portainer/issues/1753#issuecomment-794565078) on the portainer project to enable a redeploy from github, but for now if you need to change the compose you have to either tear down the stack and recreate it or edit the compose in the web editor and update the stack.

## Concurrency

One thing you'll have to face is the fact that not all app services can be run concurrently. By default the swarm scales to one running service. This is great for resilience, a fail in one node will cause the container to start up on another node. But in terms of load balancing and performance a non-concurrent app does nothing to help.

If you do have a service that can be run as multiple instances, then you can spread it across the nodes simply by scaling out the service to the number of instances you want. Under the service menu in portainer next to the service under scheduling mode is the ability to scale it to the number you require.

With multiple instances you now need to think about how users are going to access and use them. In my case I now have the three swarm servers listening on port 12480 and serving my concurrent service application.

I can give the user any of the URL's [http://swarm1:12480](#), [http://swarm2:12480](https://warlord0blog.wordpress.com/wp-admin/post.php?post=8898&action=edit#), [http://swarm3:12480](https://warlord0blog.wordpress.com/wp-admin/post.php?post=8898&action=edit#), even if I only have it scaled out to ONE service. This is because the swarm uses it's own load balancer and will figure out how to service your users request on any of the URL's.

It's still a good idea to put a reverse proxy in front of them, not just for terminating the SSL endpoint. This will let me use one name and make a simpler URL for my users, eg. [http://myservice.domain.tld](#). It also provides resilience to ensure I get directed to another of the working nodes if one goes offline. For this I use Nginx and subtly change my upstream server config to include all three servers:

```
upstream myservice-container {
    server swarm1:12480 weight=1 fail_timeout=30s;
    server swarm2:12480 weight=1 fail_timeout=30s;
    server swarm3:12480 weight=1 fail_timeout=30s;
}

server {
  listen 80;
  server_name myservice.domain.tld;

  location / {
    proxy_pass http://myservice-container;
```

- Above shows only a simple snippet for http, not https.

This will round robin the calls made to [http://myservice.domain.tld](#) between the three swarm servers. If one of them is down I'll still hit a working node and still get load balanced by the swarms balancer too.

### Sessions

If what I'm providing is a micro service that has no need of session management then this will be fine. But if my application requires me to login and use sessions then there's every chance this won't work without telling the swarm and Nginx to send me to the same node server every time. (see [Nginx Load Balancing](http://nginx.org/en/docs/http/load_balancing.html))

This can be tricky as the way your service application stores session data needs to be capable of handling this environment. If your app stores session details on the local file system this won't be replicated between hosts (unless it's on NFS). If you end up directed to a different node than where your session data is held you may find unexpected behaviour, like being thrown out or not being able to login. Your app must store sessions in a common location, eg. a central database or use a distributed cache like redis.

I can make the Nginx sessions sticky by adding in the `ip_hash` directive.

```
upstream myservice-container {
    ip_hash;
    server swarm1:12480 weight=1 fail_timeout=30s;
    server swarm2:12480 weight=1 fail_timeout=30s;
    server swarm3:12480 weight=1 fail_timeout=30s;
}
```

This change on it's own will tell Nginx to be sticky with it's sessions, but we'll still have load balancing at the swarm end unless we turn it off. To disable the swarm load balancing you can add the `network_mode:` stanza into your compose file:

```
network_mode: host
```

|  |  |
|----|----|
| **Service Type** | **Configuration** |
| No session management required | Use the default swarm load balancer |
| Sessions managed by central database or redis | Use the default swarm load balancer |
| Sessions stored in local filesystem | Disable the default swarm load balancer, add `ip_hash` to `nginx.conf` |

Load Balancing
