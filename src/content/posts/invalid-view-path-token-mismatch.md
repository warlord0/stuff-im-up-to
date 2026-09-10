---
pubDatetime: 2016-11-07T09:56:29Z
modDatetime: 2016-11-07T12:15:19Z
title: "Invalid View Path, Token Mismatch"
tags:
  - "Laravel"
heroImage: "/blog-media/2016/09/laravel.jpg"
description: "Somehow I managed to bork my Laravel development app. I'm not entirely sure what I did as I only changed one of my config files, but I was getting a blank"
---
Somehow I managed to bork my Laravel development app. I'm not entirely sure what I did as I only changed one of my config files, but I was getting a blank page when visiting the site. Checking the Laravel log showed nothing. Checking the Nginx logs suggested a permission problem. So I cleared the storage folder and things didn't get any better! So I Tried:

    $ php artisan cache:clear
    $ php artisan config:clear
    $ php artisan view:clear

Which resulted in:

> \[RuntimeException\] View path not found.

I then looked at another working example on the live site and checked out the structure under the storage folder. It was creating some of the folders but not others. I had a storage/framework/cache folder, but no storage/framework/sessions or storage/framework/views folder. First step was to create the storage/framework/views folder and set the permissions so that www-data could read and write to it:

    $ sudo mkdir storage/framework/views
    $ sudo chmod 775 storage/framework/views

This then triggered some forward motion, but then I got the "CSRF Token Mismatch" error. Which from experience is related to sessions and with that folder not existing all I had to do was create that one too.

    $ sudo mkdir storage/framework/sessions
    $ sudo chmod 775 storage/framework/sessions

Revisit the page and up it comes.
