---
pubDatetime: 2017-10-13T10:17:49Z
title: "Git - Version Control"
tags:
  - "apache"
  - "git"
  - "java"
  - "tomcat"
  - "Web"
description: "We have a distinct lack of version control in the relatively small development team that manages one of our business applications. One of the main challeng"
---
We have a distinct lack of version control in the relatively small development team that manages one of our business applications. One of the main challenges isn't really related to the developers, but to the vendor that connects remotely and "fixes" things without leaving any clue as to what has been changed. So I came up with a sneaky plan to deploy Git onto the servers and manage the versions of configuration files used by the application. I can then capture any changes and roll back as necessary. I've made use of Git a few times on a personal level and also on a small in house project, but not really grown into a remote repository for business use. Mainly because the sort of stuff I've developed is suitable for Open Source or because there is no way we are paying github a monthly fee to host a small project as a business. So I took a look at [Gitlabs](https://about.gitlab.com/). I can run up a Linux box and carry out a pretty simple install that includes everything to get it running without any great head ache. That parts pretty simple, but what has me screaming out is trying to get Git to only whitelist the files and folder I actually want to monitor. I need Git to manage only a few sub level folders and exclude many, many others. Using `.gitignore` is the way to ignore files, but you can also use an exclamation mark (!) to negate an ignore. Sounds simple? Far from it I spent ages trying to get things to work the way I wanted it to. It wasn't until I discovered this post that it finally solved my problems. [https://jasonstitt.com/gitignore-whitelisting-patterns](https://jasonstitt.com/gitignore-whitelisting-patterns) Ignore this, unignore that and just didn't work until I used this method. The vendor in their ultimate wisdom have decided to install ALL of their products and dependencies into a folder based on their company name, let's call them NAKA. Underneath there we have Apache HTTPD and Tomcat, their application and application homes and inside the Tomcat webapps configuration files that are used and files our staff change. The `.gitignore` in the `/NAKA/` folder needed to exclude everything and then include only the files/folders I wanted.

    # Ignore everything
    *

    # But continue to process sub folders
    !*/

    # Now we add files/folders we actually want to monitor
    # Any version of Apache
    !apache*/conf/**

    # Any version of apache-tomcat and the key sub folders to watch
    !apache-tomcat*/conf/**

    !apache-tomcat*/webapps/Configuration/**

    !apache-tomcat*/webapps/guidance/**

    # The vendors application home where ever that might be
    !**/myapphome/*.properties
    !**/myapphome/*.xml

Probably best not to ask why they install it like that as their answer will melt your face.

- This is how I got it working in Git version 2.11.0
