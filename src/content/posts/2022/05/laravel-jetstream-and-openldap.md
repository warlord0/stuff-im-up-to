---
pubDatetime: 2022-05-21T12:53:31Z
modDatetime: 2022-05-24T20:41:48Z
title: "Laravel Jetstream and OpenLDAP"
tags:
  - "JavaScript"
  - "Laravel"
  - "LdapRecord"
  - "php"
  - "tailwindcss"
  - "Web"
heroImage: "/blog-media/2019/08/laravel-2019-logo-1.png"
description: "It's been a very long time since I did anything with Laravel. I found another job around the time of Laravel 6, and today they are up to Laravel 9 - much h"
---
It's been a very long time since I did anything with Laravel. I found another job around the time of Laravel 6, and today they are up to Laravel 9 - much has changed.

I was keen to look at using Laravel with LDAP both for authentication and management.

## Building the App

First, I had to figure out how to get all the parts I used to know working again. It seems there are new JavaScript components and a change of CSS framework. I wanted to get back to using [Vue.js](https://vuejs.org), and it seemed not very straight forward to do that - until I discovered this article:

[https://laravel.io/articles/setting-up-laravel-with-inertiajs-vuejs-tailwind-css](https://laravel.io/articles/setting-up-laravel-with-inertiajs-vuejs-tailwind-css)

This worked out well, and I have an environment where I can use Vue. I just have to figure out the differences required for me to adopt [TailWindCSS](https://tailwindcss.com).

There are quite a few new things to figure out. Inertiajs is the glue that brings Laravel and vue together.

For handling LDAP processes I previously I would have used Adldap2-Laravel, this has been superseded by [LdapRecord-Laravel](https://ldaprecord.com/docs/laravel/v2). At the time of writing, it's not ready for Laravel 9. This means the setup of the Vue.js project above must be done using Laravel 8:

```
composer create-project laravel/laravel:^8.0 myproject
```

## Using LDAP

I want to use my Laravel project to manage LDAP and authenticate using LDAP, I don't really want to synchronise my LDAP credentials over into a database.

Going through the LdapRecord setup guide, I find I need to install Jetstream. Jetstream is Laravel's authentication starter kit. When you first start looking at a simple application, you'll find Laravel has Breeze and Jetstream for authentication. Breeze is the basic offering using database authentication - Jetstream is a step-up to using different authentication platforms.

I can do this by ignoring the synchronisation settings. I have to be sure to make sure I notice the changes in code to use OpenLDAP, not Active Directory. At the end of the guide I find I have a number of Vue pages for login and registration and can launch the app from my browser - with one problem.

When I tried to log on, I saw in the LDAP logs that it was successful, but Laravel failed with a database error. It could not write to the session table because the `user_id` column does not match the data type it's trying to write.

```
SQLSTATE[22P02]: Invalid text representation: 7 ERROR: invalid input syntax for type bigint: "7bde0af4-e393-1039-8b6c-117754cdf7d5" (SQL: update "sessions" set "payload" = YTo0OntzOjY6Il90b2tlbiI7czo0MDoiUjNad09lUmFuemhOZGZ6elBQU0ZFalpWMUxZdEkzRGJwdlpRZUt0bCI7czo2OiJfZmxhc2giO2E6Mjp7czozOiJvbGQiO2E6MDp7fXM6MzoibmV3IjthOjA6e319czo5OiJfcHJldmlvdXMiO2E6MTp7czozOiJ1cmwiO3M6Mjc6Imh0dHA6Ly8xOTIuMTY4LjEyMi4xOTE6ODAwMCI7fXM6NTA6ImxvZ2luX3dlYl81OWJhMzZhZGRjMmIyZjk0MDE1ODBmMDE0YzdmNThlYTRlMzA5ODlkIjtzOjM2OiI3YmRlMGFmNC1lMzkzLTEwMzktOGI2Yy0xMTc3NTRjZGY3ZDUiO30=, "last_activity" = 1653135298, "user_id" = 7bde0af4-e393-1039-8b6c-117754cdf7d5, "ip_address" = 192.168.122.1, "user_agent" = Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.162 Safari/537.36, "id" = 5hu2fA8e10NguxqYewrbt2zku31uVSVMXNUWpdr1 where "id" = 5hu2fA8e10NguxqYewrbt2zku31uVSVMXNUWpdr1)
```

In the migration for `...create_sessions_table.php` I see it is using a `foreignId` for the column type.

```
Schema::create('sessions', function (Blueprint $table) {
    $table->string('id')->primary();
    $table->foreignId('user_id')->nullable()->index();
    $table->string('ip_address', 45)->nullable();
    $table->text('user_agent')->nullable();
    $table->text('payload');
    $table->integer('last_activity')->index();
});
```

I'm guessing in most cases this would be OK for sessions related to a database ID, but using LDAP it's coming up with the `entryUUID` for `user_id`. I changed this to:

```
$table->uuid('user_id')->nullable()->index();
```

Then rolled back and forward the migration to change the column type, and now I can log on, and the session table gets updated correctly.

## Access to LDAP Attributes

One thing I didn't want is for Laravel to have access to all of my LDAP users attributes - especially `userPassword`, but also anything else I may have in there that I don't need for basic authentication, or attributes my app has no need of.

I could see all LDAP attributes were available to Laravel from the [Vue Dev Tools](https://devtools.vuejs.org) extension in my browser

For this, I created an LDAP User Model as per LdapRecord:

```
php artisan make:ldap-model User
```

Now edit the file `Ldap\User.php`, change the class extension, and set up the protected variables:

```
<?php

namespace App\Ldap;

// use LdapRecord\Models\Model;

class User extends \LdapRecord\Models\OpenLDAP\User
{
    /**
     * The object classes of the LDAP model.
     *
     * @var array
     */
    protected $hidden = ['userPassword'];
    protected $visible = ['cn', 'mail', 'sn', 'givenName', 'initials'];

    public static $objectClasses = [
        'top',
        'person',
        'organizationalperson',
    ];
}
```

I probably don't need `$hidden` and `$visible`, as `$visible` should allow access to only those attributes I want it to. Now change the `config/auth.php` so it uses this user model and not the default:

```
'ldap' => [
    'driver' => 'ldap',
    'model' => App\Ldap\User::class,
    // 'model' => LdapRecord\Models\OpenLDAP\User::class,
],
```

Now, when I log on to the Jetstream app and look in the Vue Dev Tools, I only see the white listed attributes as per `$visible`.
