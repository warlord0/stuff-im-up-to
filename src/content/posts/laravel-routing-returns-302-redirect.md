---
pubDatetime: 2018-11-20T08:06:14Z
modDatetime: 2018-11-20T08:11:05Z
title: "Laravel Routing Returns 302 Redirect"
tags:
  - "Laravel"
  - "php"
  - "Web"
heroImage: "/blog-media/2016/09/laravel.jpg"
description: "That was a frustrating few hours. I added a route into my api.php route and every time I visited it it triggered a redirect. I saw nothing in the browser and it was like my controller function wasn't even being called."
---
That was a frustrating few hours. I added a route into my `api.php` route and every time I visited it it triggered a redirect. I saw nothing in the browser and it was like my controller function wasn't even being called.

I put the usual `dd()` and `dump()` into my function and it wasn't being called. I even changed the function name so it didn't exist and thought I'd get an error message, but nothing - still a redirect.

**What is going on?** I expanded out the call from "Namespace\Class@function" to put in a `function () {}` and that was being called and ran ok.

Clearly there was something wrong with my class somewhere. The other functions within it worked fine, just this new one didn't even seem to be there.

Sure enough a bit of Duck-Jitsu and I found this: [https://stackoverflow.com/questions/35020477/laravel-unexpected-redirects-302](https://stackoverflow.com/questions/35020477/laravel-unexpected-redirects-302) - answer 3 is where I got my clue.

I looked at my class constructor and I was using the auth middleware to ensure the functions were not used unless authenticated.

```
public function __construct() {
  $this->middleware(['auth:api']);
}
```

For my function I wasn't using any authentication, so of course I was getting a redirect. But because it's an api call and the expected return in JSON under an XHttpResponse I wasn't able to properly debug it. I was getting back a HTML page instead.

As a work around all I needed to do was add in an exception for my function:

```
public function __construct() {
  $this->middleware(['auth:api'], ['except' => [ 'myFunction' ]]);
}
```

Now all I have to do is go back and sort out the authentication for the function so I don't need to bypass it.
