---
pubDatetime: 2020-07-28T16:31:05Z
modDatetime: 2021-01-29T10:48:27Z
title: "Apache Directory Studio - JNDI"
tags:
  - "java"
  - "ldap"
  - "Networking"
heroImage: "/blog-media/2021/01/apachedirectorystudio.png"
description: "I've never had a comfortable relationship with Java. Every time something goes a bit wrong in something that uses Java, I spend hours and even days trying"
---
I've never had a comfortable relationship with Java. Every time something goes a bit wrong in something that uses Java, I spend hours and even days trying to figure out why the wheels have come off.

Given that Apache Directory Studio hasn't been updated in years, when all of a sudden my remote connection to manage my LDAP server stopped working - I had to think, "it's Java."

I wasn't wrong

When viewing the properties for my LDAP Connection I see it has switch the network provider to "Apache Directory LDAP Client API", which I know does not work over SOCKS. It should be set to "JNDI (Java Naming and Directory Interface)" - but that's mysteriously disappeared.

I'm sure it's because I applied some system updates though - but try as I might I cannot find anything about installing JNDI.

I took a look at what version of Java I'm using and see I have [OpenJDK](https://openjdk.java.net/) 11 as a default when I use show version:

```
$ java --show-version

openjdk 11.0.8 2020-07-14
OpenJDK Runtime Environment (build 11.0.8+10-post-Ubuntu-0ubuntu120.04)
OpenJDK 64-Bit Server VM (build 11.0.8+10-post-Ubuntu-0ubuntu120.04, mixed mode, sharing)
```

But when I do a trawl throw apt I see I also have version 8 sneaking in there too.

```
$ apt list --installed | grep -i openjdk                                                                                     

WARNING: apt does not have a stable CLI interface. Use with caution in scripts.

openjdk-11-jdk-headless/focal-updates,focal-security,now 11.0.8+10-0ubuntu1~20.04 amd64 [installed,automatic]
openjdk-11-jdk/focal-updates,focal-security,now 11.0.8+10-0ubuntu1~20.04 amd64 [installed]
openjdk-11-jre-headless/focal-updates,focal-security,now 11.0.8+10-0ubuntu1~20.04 amd64 [installed,automatic]
openjdk-11-jre/focal-updates,focal-security,now 11.0.8+10-0ubuntu1~20.04 amd64 [installed,automatic]
openjdk-8-jre-headless/focal,now 8u252-b09-1ubuntu1 amd64 [installed,automatic]
```

Looking at the Apache Directory Studio [FAQ](https://directory.apache.org/studio/faqs.html#how-to-set-the-java-vm-to-use) I notice you can specify the Java to use with the `-vm` option in the `ApacheDirectoryStudio.ini` file.

So let's see what happens if I point it at my Java version 8 by adding in the two lines, before the `-vmargs` line:

```
-vm
/usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java
```

So it becomes:

```
-startup
plugins/org.eclipse.equinox.launcher_1.5.0.v20180512-1130.jar
--launcher.library
plugins/org.eclipse.equinox.launcher.gtk.linux.x86_64_1.1.700.v20180518-1200
/studio-rcp/resources/icons/linux/studio.xpm
--launcher.GTK_version
2
-vm
/usr/lib/jvm/java-8-openjdk-amd64/jre/bin/java
-vmargs
-Dosgi.requiredJavaVersion=1.8
```

Fire up Directory Studio and presto JNDI is back as an option and I can now get back to managing my LDAP servers.
