---
pubDatetime: 2021-01-27T21:45:18Z
modDatetime: 2021-01-27T21:48:55Z
title: "Switching Java in Manjaro"
tags:
  - "java"
  - "Linux"
description: "I've a few programs that require Java and some need older version that others. I currently have openjdk 8 and 11 installed and needed to switch the default"
---
I've a few programs that require Java and some need older version that others. I currently have openjdk 8 and 11 installed and needed to switch the default version from 8 to 11.

What's installed:

```
$ archlinux-java status                             
Available Java environments:
  java-15-openjdk 
  java-8-openjdk/jre (default)
```

Changing it is as easy as copying the name and using set:

```
archlinux-java set java-15-openjdk
```

## References

[https://wiki.archlinux.org/index.php/java#Switching_between_JVM](https://wiki.archlinux.org/index.php/java#Switching_between_JVM)
