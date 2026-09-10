---
pubDatetime: 2018-02-18T15:21:21Z
modDatetime: 2018-02-18T15:31:41Z
title: "Laravel API Token Auth"
tags:
  - "ajax"
  - "JavaScript"
  - "Laravel"
  - "php"
  - "Web"
heroImage: "/blog-media/2016/09/laravel.jpg"
description: "The newer versions of Laravel support OAuth for token auth, but I wanted to carry on using something simple. Just a token stored in the user table and some"
---
The newer versions of Laravel support OAuth for token auth, but I wanted to carry on using something simple. Just a token stored in the `user` table and something that can be passed when calling an api from within my own application. This article had the workings for me: [https://andrew.cool/blog/64/How-to-use-API-tokens-for-authentication-in-Laravel-5-2](https://andrew.cool/blog/64/How-to-use-API-tokens-for-authentication-in-Laravel-5-2) In simple terms out of the box Laravel is already configured to use token auth for api calls. All we need do is add the column `api_token` to the user table and give users a unique token. Then they can pass that token into an api call either by adding it to the query string, the form values or an authorisation header. eg.

    /api/myfunction?api_token=$2y$10$Mgwlo.sOAZz5DIPY49dtGuyYUo2nU/wDwgFf6gRYFm94OWP35dO4q

First create and run a migration that adds the api_token column. If you already have a bunch of users you'll need to give them an `api_token` value too. To automatically give the new users a token I amended the `Users.php` model

        /**
         * The attributes that should be hidden for arrays.
         *
         * @var array
         */
        protected $hidden = [
            'password', 'remember_token', 'api_token'
        ];

        public static function boot() {
          parent::boot();
          self::creating(function($users) {
            $users->api_token = \Hash::make(\Carbon\Carbon::now()->toRfc2822String());
          });
        }

By adding in a `boot()` function I added in a default value for `api_token` which is just a hash of the current date time, but could be anything you'd like. This gets called every time you use `new User`. In my `layouts.app` I then added a meta header similar to the csrf-token, but for api_token.

    meta name="api_token" content="{{ (Auth::user()) ? Auth::user()->api_token : '' }}"

  This only adds the token if you are authenticated. I can then reference it in my JavaScript

    $.ajaxSetup({
      headers: {
        'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content'),
        'Authorization': 'Bearer ' + $('meta[name="api_token"]').attr('content'),
       }
    });

By adding it into the `headers` as authorisation like this in the `ajaxSetup` it will get passed with any jQuery `ajax` call on the page. It also will remain hidden from form variables and query string. In my api routes any middleware set as `auth:api` will immediately validate the token. So in my `routes\api.php`

    Route::middleware('auth:api')->get('/user', function (Request $request) {
      return $request->user();
    });

The `/api/user` route above will require a token. But I can also add the requirement into my Controller in `__construct()` so every call to the controller functions must have api authorisation.

    class DataController extends Controller {

      public function __construct() {
       $this->middleware(['auth:api']);
     }
    ...

The nice part about the controller construct is that everything inside will need to pass authentication. So there's no worries about adding a function ofrsomething and forgetting to check. But you can disable it for some functions to. Just add and except array of function names:

    class DataController extends Controller {

      public function __construct() {
        $this->middleware(['auth:api'], ['except' => ['thisfunction', 'thatfunction']]);
      }
    ...
