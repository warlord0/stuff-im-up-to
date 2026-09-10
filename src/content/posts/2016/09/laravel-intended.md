---
pubDatetime: 2016-09-13T19:35:15Z
modDatetime: 2016-09-17T18:38:40Z
title: "Laravel Redirect to Intended"
tags:
  - "Laravel"
heroImage: "/blog-media/2016/09/laravel.jpg"
description: "Getting where you intended to go with Laravel"
---
Sounds simple enough right? You follow a URL to your Laravel site and after you logon you want to continue to the link you intended. Hmm, well I fell over that one. Seems everytime I logged on I ended up at /home Turns out all I needed was a constructor in my Controllers that used middleware.

    public function __construct()
    {
        $this->middleware('auth');
    }

Then as long as my LoginController uses

    return redirect()->intended('/home');

I get directed where I intended to go. /home is just the default location to go to if I didn't specify anything.
