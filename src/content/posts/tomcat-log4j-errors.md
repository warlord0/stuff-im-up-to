---
pubDatetime: 2017-10-12T07:04:07Z
title: "Tomcat log4j Errors"
tags:
  - "java"
  - "tomcat"
  - "Web"
heroImage: "/blog-media/2017/01/2000px-tomcat-logo-svg-e1485850229861.png"
description: "log4j:WARN The content of element type \"log4j:configuration\" must match \"(renderer*,throwableRenderer?,appender*,plugin*,(category|logger)*,root?,(categoryFactory|loggerFactory)?)\"."
---
As I've been spending a lot of time with Tomcat these days I've tried to clear out the stderr log of error messages. One of the frustrating warnings I had to deal with was this:

    log4j:WARN Continuable parsing error 208 and column 23
    log4j:WARN The content of element type "log4j:configuration" must match "(renderer*,throwableRenderer?,appender*,plugin*,(category|logger)*,root?,(categoryFactory|loggerFactory)?)".

The `log4j.xml` file parsed correctly and was obviously working as we were seeing log output. But this error had me baffled for a while. I checked the syntax of the xml file, ensured it was sound structurally and couldn't for the life of me spot the problem. Turns out the order of the elements in the file is important and must match the order of the string listed above. We'd got some `logger` elements after the `root` element. A move of the `root` element below the `logger` elements and the error message went away.
