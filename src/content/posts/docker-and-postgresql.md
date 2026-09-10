---
pubDatetime: 2020-01-10T11:21:00Z
modDatetime: 2020-01-15T20:11:14Z
title: "Docker and PostgreSQL"
tags:
  - "Docker"
  - "Uncategorized"
heroImage: "/blog-media/2020/01/moby-logo.png"
description: "New job, new challenges. I've come across docker in the past, but have pretty much been on the follow these commands to fire up a docker and then use it. N"
---
New job, new challenges.

I've come across docker in the past, but have pretty much been on the follow these commands to fire up a docker and then use it. Now I find myself in a place where much of the infrastructure of the new work place is built on docker or some measure of virtualisation of containers and hosts.

## Install Docker

First setup docker using the relevant [installation guidance](https://docs.docker.com/install/linux/docker-ce/ubuntu/). In my case the new workstation is Linux Mint 19.3 (tricia) which is Ubuntu based, but meant I had to jig the install slightly to match the Ubuntu build name of "bionic" not the Mint build name of "tricia".

```
$ cat /etc/os-release                                                             
NAME="Linux Mint"
VERSION="19.3 (Tricia)"
ID=linuxmint
ID_LIKE=ubuntu
PRETTY_NAME="Linux Mint 19.3"
VERSION_ID="19.3"
HOME_URL="https://www.linuxmint.com/"
SUPPORT_URL="https://forums.ubuntu.com/"
BUG_REPORT_URL="http://linuxmint-troubleshooting-guide.readthedocs.io/en/latest/"
PRIVACY_POLICY_URL="https://www.linuxmint.com/"
VERSION_CODENAME=tricia
UBUNTU_CODENAME=bionic
```

I created an apt list file `/apt/sources.list.d/docker.list` and put in the entry:

```
deb [arch=amd64] https://download.docker.com/linux/ubuntu bionic stable
```

After installing docker I followed on through to install [`docker-composer`](https://docs.docker.com/compose/) as this allows me to group a number of docker containers to provide the services I require.

In order for my regular user to manage containers and volumes etc. I added it to the `docker` group:

```
$ sudo gpasswd -a myuser docker
```

## Create a YAML file

Make a directory for a collection of containers. Reaaly just a location for configuration files for it. Within the folder create a file called `docker-composer.yaml`. This will contain the specifics about what docker containers you want to create, what images they use and what resources they provide or require:

```
version: '3'
services:
  db:        
    container_name: pgsql10
    image: postgres:10
    volumes:
      - data:/var/lib/postgresql/data
    restart: always
    environment:
      POSTGRES_PASSWORD: mysupersecretkey
    ports:
      - 5432:5432        
  adminer:
    container_name: adminer
    image: adminer
    restart: always
    ports:
      - 8080:8080
volumes:
  data:
```

I this case I am creating a container for PostgreSQL 10 and a container for adminer that is a web based database administration tool. So I can run postgres and use adminer to manager/test it.

The important entries are:

`image:` the name and tag of the image to install from docker hub.

`environment:` contains specific environmental variables for this server. In this case the 'postgres' users password so we can login.

`volumes:` this creates a docker volume called 'data' and will mount it inside the container at `/var/lib/postgresql/data`. This will be the non-volatile storage used by the service. So the service can be torn down and replaced, but the docker volume will still have the data within it.

`ports:` In this case what port mapping is used. The number before the colon is presented to the OS and the number following it is the port it forwards to within the container.

If I then bring the containers up using:

```
$ docker-composer up -d
```

This will begin initializing the containers, firstly by pulling down the images `postgres:10` and `adminer` from the docker hub. The data volume will be created and mounted into the container. The posgres image has it's own initialization and will create the database if required.

> **That's it!** I now have a running PostgreSQL 10 instance.

I can test the both containers and connect to the postres instance by visiting `http://localhost:8080` in a browser. Change the System type to `PostgreSQL`, server to `db`, username to `postgres` and the password specified in the environment above. Click Login and you should find yourself able to manage the database.

You can also skip adminer and use whatever DB tools you like such as [DBeaver](https://warlord0blog.wordpress.com/2018/11/06/dbeaver-sql-gui/), or just go connect your application to it like you would any regular instance of postgres.

To stop the container services from within the folder holding your `docker-composer.yml`:

```
$ docker-compose down
```

This will tidy things up removing temporary storage etc. but leaves your data volume 'as is' so it's ready for the next time you want to start the containers.

There's more magic capable using composer, such as not exposing ports to anything other than other containers within the same composer group of containers, which really add a layer of application security by not exposing services to systems that don't require them.

#### Some useful commands:

```
$ docker-composer ps
$ docker-composer images
$ docker volume ls
$ docker ps
$ docker ps -a
$ docker-compose exec -u postgres db psql -l
$ docker-composer logs -f db
```

### Mapping a local filesystem to a docker volume

Instead of creating a docker volume to hold the 'data' in I decided to map a local folder into my docker container. This is so I can see and edit the content mapped into the docker filesystem. Typically this is done for data and configuration files/folders.

Instead of using the volume name 'data' change it to the path to the folder you want mapped into the container - no need to create the folder it will be created and managed by docker:

```
version: '3'
services:
  db:
    container_name: pgsql10
    image: postgres:10
  volumes:
    - ./data:/var/lib/postgresql/data
```

It's a subtle change but now you'll see a subfolder 'data' appear in the path of your 'docker-composer.yml' file when you bring the container up.

There is an important difference in the way the docker image works over a standard Debian installed version of postgres. The configuration files are placed in the same folder as the data on the docker image. So there's no need to do anything with `/usr/share/postgressql/...` as a default set of config files `postgresql.conf` and `pg_hba.conf` are created in with the data. Once your container is brought up you should be able to edit the files within the `./data` folder (you'll probably need `sudo` as the `./data` folder permissions wont be compatible with your user).

#### Permissions Errors

Being new to docker I started out creating a` docker-compose.xml` on my home share and when firing it up my container kept on restarting. Looking at the docker logs for my container it returned an odd message:

```
chown: changing ownership of 'data': Invalid argument
```

I first thought it an issue with my config, but it was way more fundamental than that. My home share is a mounted NFS share and the deploy process can't change the permissions to the file system. I just moved the folders onto a local filesystem that docker could control permissions on and away we went.
