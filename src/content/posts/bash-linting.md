---
pubDatetime: 2021-02-11T11:56:02Z
modDatetime: 2021-02-11T11:58:10Z
title: "Bash Linting"
tags:
  - "bash"
  - "Linux"
description: "I had some of my bash code commented on publicly and the one comment was \"You should run your scripts through shellcheck .\" This was probably the most usef"
---
I had some of my bash code commented on publicly and the one comment was "You should run your scripts through [shellcheck](https://www.shellcheck.net)." This was probably the most useful bit of advice I've had to do with bash scripting.

You'll maybe note that previously I've used [linting](https://warlord0blog.wordpress.com/2018/08/06/linting/) for php and JavaScript and that's been immensely helpful for keeping my code tidy and correct. Well shellcheck helps do the same thing but for shell scripts.

The thing I found most useful was not the fact it picked up errors, but that it makes coding suggestions. The suggestions lead you to instructive pages that actually teaches you how to code better.

What makes this equally easy to use is there is also an extension for VSCode that actively lints as I code.

[https://marketplace.visualstudio.com/items?itemName=timonwong.shellcheck](https://marketplace.visualstudio.com/items?itemName=timonwong.shellcheck)
