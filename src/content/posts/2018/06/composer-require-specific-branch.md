---
pubDatetime: 2018-06-04T13:50:06Z
modDatetime: 2018-06-07T20:16:10Z
title: "Composer Require Specific Branch"
tags:
  - "Laravel"
  - "php"
heroImage: "/blog-media/2016/09/laravel.jpg"
description: "I'm trying to test out a version of a SAML project that doesn't include the now defunct php extension for mcrypt. Using composer require kept on grabbing t"
---
I'm trying to test out a version of a SAML project that doesn't include the now defunct php extension for mcrypt. Using composer require kept on grabbing the master branch, when I actually wanted the "remove_mcrypt" branch. I found that using composer with the branch like this failed:

    $ composer require "aacotroneo/laravel-saml2":"remove_mcrypt"

> \[UnexpectedValueException\] Could not parse version constraint remove_mcrypt: Invalid version string "remove_mcrypt"

Thanks to a stackoverflow post: [https://stackoverflow.com/questions/33525885/composer-require-branch-name](//stackoverflow.com/questions/33525885/composer-require-branch-name) I was able to resolve it by correctly prefixing the branch with "`dev-`"

    $ composer require "aacotroneo/laravel-saml2":"dev-remove_mcrypt"
