---
pubDatetime: 2018-06-07T21:04:45Z
modDatetime: 2018-06-20T16:41:01Z
title: "Emmet.io"
tags:
  - "html5"
  - "Web"
description: "Emmet — the essential toolkit for web-developers"
---
Why is it I only find stuff that would have been really useful, after it would have been really useful? I've written plenty of html using handcrafted text. Started using atom to help with auto-completion and beautify. Then I run into Emmet. Atom has this great plugin, and it's available for many other editors, that makes html coding an absolute breeze. Many times I find myself creating html template sections repetitively repeating lines for navs, closing tags adding classes etc. Emmet can easily handle the repetitive html structure by tying in what would almost be the CSS shortcut of the structure and expanding it. Once the plugin is installed into atom you can interactively enter a shortcut using ctrl+alt+enter which will bring up the interactive editor - probably the easiest starting point. Then type in the short cut in the CSS selector style eg.

    #app-navbar.collapse.navbar-collapse>ul.navbar-nav.mr-auto>li.nav-item.dropdown*3>a.nav-link.dropdown-toggle>div.dropdown-menu>a.dropdown-item*5

And watch this magically create the beginnings of a Bootstrap nav menu with 3 drop down menus with 5 items on each menu - from one line of understandable code. https://gist.github.com/warlord0/07364d060d66f2debd163267f7972aea Very, very cool. Will take me some getting used to but should speed up the creation of large repetitive structures no end. I'm already pretty excited about using it for Vue.js components too! Find more details here: [https://emmet.io/](https://emmet.io/)
