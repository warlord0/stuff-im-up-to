---
pubDatetime: 2020-01-21T19:40:00Z
modDatetime: 2020-01-21T15:08:51Z
title: "Docker Health Checks"
tags:
  - "Docker"
  - "Linux"
description: "When wanting to monitor the condition of your containers using Nagios there are some really nice features you can enable to check that your containers are"
---
When wanting to monitor the condition of your containers using Nagios there are some really nice features you can enable to check that your containers are up, not abusing the cpu etc. But wouldn't it be nice to check out what's going on inside the container too?

By using the Nagios plugin [`check_docker.py`](https://pypi.org/project/check-docker/) we are able to ping a query to the docker API to find out the condition of the containers. It will return our expected Nagios messages so we can actively monitor the states.

The plugin does require the docker API to be enabled on the docker host. When running it can return all kinds of useful json data about our containers.

To enable the Docker API I followed this [guide](https://success.docker.com/article/how-do-i-enable-the-remote-api-for-dockerd), but on my distro (Debian Buster) had to look in `/usr/lib/systemd/system` for my `docker.service` file.

I created the folder `docker.service.d` and created the file `override.conf` within it, that just contained:

```
[Service]
ExecStart=
ExecStart=/usr/bin/dockerd -H fd:// -H tcp://0.0.0.0:2376 --containerd=/run/containerd/containerd.sock
```

Now I can visit[`http://localhost:2376/containers/json?all=true`](http://localhost:2376/containers/json?all=true) in a browser and see all the juicy docker data.

With the API now active I can install and use the Nagios plugin. You can even run it from a non-Nagios system at the command line and try it out.

```
$ /usr/local/bin/check_docker --connection localhost:2376 --containers standby master --status running

OK: master status is running; OK: standby status is running
```

> But what about inside the container?

Using our `docker-compose.yml` file we can add in the checks we want run inside the container. If any of them fail and return a bad result using the Nagios plugin with the `--health` flag will pickup on any of our internal failings.

#### docker-compose.yml - services

```
master:
  container_name: master
  image: postgres:10
  volumes:
    - ./master/data:/var/lib/postgresql/data
  restart: always
  environment:
    POSTGRES_PASSWORD: letmein
  ports:
    - 5432:5432
  healthcheck:
    test: [ "CMD", "pg_isready", "-q", "-d", "postgres"]
      timeout: 45s
      interval: 10s
      retries: 10
```

By adding in a health check section I can cause docker to carry out periodic testing inside the container and pass the result out to my Nagios plugin when it checks.

```
$ /usr/local/bin/check_docker --connection localhost:2376 --containers standby master --health

OK: standby is healthy; OK: master is healthy
```

You'll obviously want to get more creative than the example here, but this lets me know that PostgreSQL is doing what it should.

### References

[https://marcopeg.com/2019/docker-compose-healthcheck](https://marcopeg.com/2019/docker-compose-healthcheck)

[https://success.docker.com/article/how-do-i-enable-the-remote-api-for-dockerd](https://success.docker.com/article/how-do-i-enable-the-remote-api-for-dockerd)
