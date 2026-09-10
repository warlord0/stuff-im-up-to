---
pubDatetime: 2016-09-06T19:03:00Z
modDatetime: 2016-09-19T19:04:21Z
title: "JQuery Selectors"
tags:
  - "JavaScript"
  - "jquery"
heroImage: "/blog-media/2016/09/jquery_logo.png"
description: "JQuery certainly saves a lot of hassle when it comes to writing JavaScript. On a recent project I've been struggling to get my head around some selectors t"
---
JQuery certainly saves a lot of hassle when it comes to writing JavaScript. On a recent project I've been struggling to get my head around some selectors to try and grab the elements I need. Along the way I found there's a lot of power in the selector and I managed to get just what I needed. I have a lot of form elements all with very common id's I didn't want to put id after id into the selector and found you could use a regular expression type of selector. I wanted to select all text inputs with an id beginning with 'am' or 'pm'. My solution:

    $('input[type="text"][id^=am],input[type="text"][id^=pm]')...

The important bits are ^= and the comma. \[id^=X\] fetches where the id begins with X and \[id\$=X\] would fetch those ending in X. The comma was the all important OR part for me. So one selector selects the matching expressions as an OR.
