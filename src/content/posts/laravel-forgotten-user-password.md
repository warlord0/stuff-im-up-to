---
pubDatetime: 2018-07-27T17:13:13Z
title: "Laravel Forgotten User Password"
tags:
  - "Laravel"
  - "Web"
heroImage: "/blog-media/2016/09/laravel.jpg"
description: "I rarely need to do this and it's always something I Google when I do. But when I forget the admin users password on my dev app I need to reset it. Easiest"
---
I rarely need to do this and it's always something I Google when I do. But when I forget the admin users password on my dev app I need to reset it. Easiest way is to use Laravel's 'tinker'

    $ php artisan tinker
    >>> use App\User
    >>> $user = User::where('username', '=', 'admin')->first()
    >>> $user->password = bcrypt('mysecret')
    >>> $user->save()
