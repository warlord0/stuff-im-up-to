---
pubDatetime: 2018-07-25T10:14:14Z
modDatetime: 2018-07-25T10:14:49Z
title: "Laravel and Vue.js Authentication"
tags:
  - "JavaScript"
  - "Laravel"
  - "vue.js"
  - "Web"
description: "You can see a theme here. Lot's of action on the Laravel and Vue.js front as I'm focusing on migrating our blades over to vue's The process ran into a prob"
---
You can see a theme here. Lot's of action on the Laravel and Vue.js front as I'm focusing on migrating our blades over to vue's The process ran into a problem when I wanted to be authenticated from the vue's. I was able to move this on thanks to the very, very, excellent article: [https://codeburst.io/api-authentication-in-laravel-vue-spa-using-jwt-auth-d8251b3632e0](https://codeburst.io/api-authentication-in-laravel-vue-spa-using-jwt-auth-d8251b3632e0) I used the basis of the article to create a controller as `VueAuth\AuthController.php` and and made some changes so that instead of using the Laravel default field of `user` to `username` instead.

    public function login(Request $request)
    {
    $credentials = $request->only('username', 'password');
      if ( ! $token = \JWTAuth::attempt($credentials)) {
        return response([
          'status' => 'error',
          'error' => 'invalid.credentials',
          'msg' => 'Invalid Credentials.'
        ], 400);
      }
      return response([
        'status' => 'success'
      ])
      ->header('Authorization', $token);
    }

This now works with the existing LDAP authentication we're using. I tidied up the `api.php` Routing a little too, using a prefix:

    Route::group(['prefix' => 'auth'], function() {
      Route::post('login', 'VueAuth\AuthController@login');
      Route::group(['middleware' => 'jwt.auth'], function(){
        Route::get('user', 'VueAuth\AuthController@user');
        Route::post('logout', 'VueAuth\AuthController@logout');
      });
      Route::group(['middleware' => 'jwt.refresh'], function(){
        Route::get('refresh', 'VueAuth\AuthController@refresh');
      });
    });
