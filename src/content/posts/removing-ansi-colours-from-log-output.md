---
pubDatetime: 2022-08-05T16:16:46Z
title: "Removing ANSI Colours from Log Output"
tags:
  - "Docker"
  - "Linux"
heroImage: "/blog-media/2020/01/moby-logo.png"
description: "Despite using the --no-color switch for docker logs, I still get colour output. This is frustrating as I just want to throw the output into a file for anal"
---
Despite using the `--no-color` switch for docker logs, I still get colour output. This is frustrating as I just want to throw the output into a file for analysis and the colour codes just add interference, eg.

```
$ docker-compose logs --no-color keycloak > output.log

keycloak_1   | ^[[0m05:44:31,409 INFO  [org.jboss.as] (MSC service thread 1-3) WFLYSRV0050: Keycloak 16.1.1 (WildFly Core 18.0.4.Final) stopped in 18ms
keycloak_1   | ^[[0m^[[0m05:44:32,915 INFO  [org.jboss.modules] (CLI command executor) JBoss Modules version 2.0.0.Final
keycloak_1   | ^[[0m^[[0m05:44:33,005 INFO  [org.jboss.msc] (CLI command executor) JBoss MSC version 1.4.13.Final
keycloak_1   | ^[[0m^[[0m05:44:33,036 INFO  [org.jboss.threads] (CLI command executor) JBoss Threads version 2.4.0.Final
keycloak_1   | ^[[0m^[[0m05:44:33,175 INFO  [org.jboss.as] (MSC service thread 1-1) WFLYSRV0049: Keycloak 16.1.1 (WildFly Core 18.0.4.Final) starting
keycloak_1   | ^[[0m^[[0m05:44:33,287 INFO  [org.jboss.vfs] (MSC service thread 1-5) VFS000002: Failed to clean existing content for temp file provider of type temp. Enable DEBUG level log to find what caused this
```

Pipe the output through `sed` like this and get clean output.

```
docker-compose logs --no-color keycloak | sed -r "s/\x1B\[([0-9]{1,2}(;[0-9]{1,2})?)?[m|K]//g" > output.log
```
