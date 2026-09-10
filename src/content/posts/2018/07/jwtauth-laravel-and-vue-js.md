---
pubDatetime: 2018-07-26T11:48:58Z
modDatetime: 2021-03-22T20:27:28Z
title: "JWTAuth, Laravel and Vue.js"
tags:
  - "JavaScript"
  - "Laravel"
  - "Web"
heroImage: "/blog-media/2018/07/feature_thumb_snip20170830_46.png"
description: "The past few days have been rather eventful trying to get JavaScript Web Tokens (JWT) to authenticate my Laravel, Vue.js environment. As per my previous po"
---
The past few days have been rather eventful trying to get JavaScript Web Tokens (JWT) to authenticate my Laravel, Vue.js environment.

As per my previous post: [Laravel and Vue.js Authentication](/posts/laravel-and-vue-js-authentication/) where I followed the very useful post this did in fact work for getting me around inside the vue router. But once I started making my own Axios calls or using api calls withing my vue's I ran into a lot of problems with every time I called an api I got unauthenticated.

The solution for me was to move to the tyson/jwt-auth development branch for 1.0 and then configure things from there.

As far as the linked article goes installing the npm/yarn vue side dependencies for `@websanova/vue-auth` is all good. This sets the vue environment up to handle the response Authorization header to pass back into the Axios requests.

But what we need to get working is the Laravel/PHP environment to actually authenticate and send out the necessary Authorization header. That's where I had to go "off piste" and do it differently.

*Using: Laravel 5.5, PHP 7.2, JWTAuth 1.0(dev) - as of today 26 July 2018.*

I'd remove any existing jwt-auth you have by reversing the article parts regarding jwt-auth you may have done. Then delete the `config/jwt.php` file for good measure. Clear your config cache and dump the autload.

```
$ rm config/jwt.php
$ php artisan config:clear
$ composer dump-autoload
```

Install JWTAuth using:

```
$ composer require tymon/jwt-auth=dev-develop
```

Then follow the guidance here: [http://jwt-auth.readthedocs.io/en/develop/laravel-installation/](http://jwt-auth.readthedocs.io/en/develop/laravel-installation/)

```
$ php artisan vendor:publish --provider="Tymon\JWTAuth\Providers\LaravelServiceProvider"
Copied File [/vendor/tymon/jwt-auth/config/config.php] To [/config/jwt.php]
Publishing complete.
                     
$ php artisan jwt:secret
```

If you don't see the `config/jwt.php` file copied you'll probably need the above config clear and dump.

## Notes about my setup

I'll include some gists below of what I've done. My setup is a little unique so you'll want to watch out for the fact I created my `AuthController.php` under a VueAuth folder and Namespace. I'm also using a few extra components like the excellent [spatie/laravel-permission](https://github.com/spatie/laravel-permission) and [adldap2/adldap2-laravel](https://github.com/Adldap2/Adldap2-Laravel) to do the authentication from our Domain Controllers.

We also authenticate using a `username` field rather than the Laravel default field of `email`. So on my vue side forms I'm passing over username and password and on my AuthController side I'm matching those from the `$request` into my `$credentials` used by the Validator and `\JWTAuth::attempt()`.

#### config/auth.php

Make Laravel use 'jwt' for the api guard by setting the driver to 'jwt' in `config/auth.php`​.

#### routes/api.php

Add the required api routes into `routes/api.php` - I've use a `Route::group` to make things consistent.

#### VueAuth\AuthController.php

The `AuthController.php` needs to be able to respond to Vue requests using the expected format for `@websanova` which not only includes the `login()` response Authorization header, but also a json status of success so vue's then get authenticated correctly.

The vue site using `@websanova` gets to know who the user is by using `$auth.user()`. The AuthController responds with the json of status and the user model eg.

```
return [ "status" => "success", "data" => $user ];
```

In my environment I've extended this using the `with('roles')` to include the spatie roles so I can get the role membership information from within my vue's too.

To apply the authentication to my Controllers I can either add `->middleware(['auth:api'])` to my routes in `api.php` or put them in my controllers constructor. I tend to prefer putting it into my constructor so I know my controller is protected. eg.

```
class MyController extends Controller
{
  public function __construct()
  {
    $this->middleware(['auth:api']);
  }
...
```

### app\User.php

Here I added the use of `JWTSubject` and implement to the User class. I also added in the necessary functions `getJWTIdentifier()` and `getJWTCustomClaims()`.

- Be aware I also have some spatie and ldap stuff in here

## jwt.io

I found the [jwt.io website](https://jwt.io/) really useful for debugging the Authorization headers. Just copy and paste and make sure what you're seeing from both response and request are the same. You can even take it a step further and decode the fields for iat, exp and nbf using [Date Epoch Converter](http://esqsoft.com/javascript_examples/date-to-epoch.htm) so you know when the token was issue, expires and is not valid before times.

## Gist of all the mentioned files

Sorry it's all one long list, but I don't know how to separate files from one gist.

https://gist.github.com/warlord0/a473aed20ae9c11dab2df85c28c292f5
