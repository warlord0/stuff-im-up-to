---
pubDatetime: 2019-09-25T18:39:38Z
title: "Developing in Windows"
tags:
  - "Windows"
description: "Surely not! Whoever would want to develop software using Windows? Well over the past week or so I've been taking a look at how things would look if I were"
---
Surely not! Whoever would want to develop software using Windows?

Well over the past week or so I've been taking a look at how things would look if I were to develop using Windows as the OS.

There are a few challenges. One of them relating to [CRLF vs LF](https://warlord0blog.wordpress.com/2019/09/04/vscode-crlf-vs-lf-battle/), but there are also a few other issues that add complexity.

For instance, using Nginx and redis server on Windows, isn't as simple as grabbing them from the apt repository and installing them so they start as a service. Both of these are a little clunky when it comes to setting them up as Windows services, not impossible, but certainly not point and click.

Then what about using different versions of PHP depending upon the project you are working on? Pretty straight forward on Linux, but frustrating on Windows.

> That was until I came across [Laragon](https://laragon.org/).

Laragon bundles a load of services and programs into a convenient wrapper so you can easily chop and change your development platform to suit your project.

Laragon includes services for web servers, both Apache and Nginx - including SSL/HTTPS support. It includes redis server. Includes the ability to swap PHP versions, run Node.js and provision databases using MySQL.
