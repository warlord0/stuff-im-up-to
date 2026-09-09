---
pubDatetime: 2019-09-30T17:26:57Z
modDatetime: 2019-09-30T19:39:20Z
title: "Laravel and Firebase Sync"
tags:
  - "firebase"
  - "Laravel"
  - "Web"
description: "Today I've been working on an idea I've had for a while now. Sometimes you want your internal data exposed to the outside world, but don't really want to o"
---
Today I've been working on an idea I've had for a while now. Sometimes you want your internal data exposed to the outside world, but don't really want to open any firewall rules or create a reverse proxy etc.

Typically this could be used for a mobile application or forms product to access data that is created internally, but external users need to use it for form lookups or choices driven by your live system.

For this I looked at synchronising a table with Google Firebase cloud service.

I went back to the methods used in [Laravel Caching Indefinitely](https://warlord0blog.wordpress.com/2019/06/28/laravel-caching-indefinitely/) and capture the created, updated and deleted events using an observer.

This time instead of invalidating the cache I created, updated or deleted a matching record in Firebase. As manipulating Firebase is a simple case of using Json, Laravel is pretty well matched to make this process pretty simple.

Whatever model you create or intend to use just make sure it has a column that holds the unique Firebase push key. Then each update or deletion can find the Firebase push key in the record set and update or delete that specific entry.

The is an great ready made SDK to interface with Firebase that can be found here: <https://github.com/kreait/laravel-firebase>

You can install it using composer and configure it by creating a service account credential file that you get from the Firebase console. Once you have the file you reference it in your `.env` file and all the hard work is pretty much done for you.

I created a model called `FireSync` and migration that created my columns and added in a string field called `push_key`.

```
php artisan make:model FireSync -m
```

Then made an observer to fire some events:

```
php artisan make:observer FireSyncObserver
```

Which I edited and put in the following gist:

https://gist.github.com/warlord0/977c8ec955ad4b0c23739a23703a7372

In the Firebase console I created a simple parent/child structure `recordset/records` but this could obviously be anything. I used this in my observer as the `$_baseReference` so Laravel creates the records where I want them.

Now when any rows are added, updated or deleted in the `FireSync` model the changes are replicated to Firebase.

Laravel creates a record in Firebase and then takes the newly created Firebase push key and updates the model with it. To do this without firing an update event I used the models `withoutEvents()` function as there's no need to call the update event if we've just added the push key.

Notice that I made the model attribute `push_key` hidden. This is because I don't need the attribute putting into Firebase as it's already there.

You may want to get a bit more creative with what data you actually want from the model replicating to the cloud. For this I'd look at using Laravel helper functions like [`Arr::except()`](https://laravel.com/docs/5.8/helpers#method-array-except) to filter out columns you don't want on the cloud.

It could also be possible to not use the push key, but use the models unique `id` column. You'd need to set the Firebase rules for `.indexOn` to your child column name and order by that instead of the key - I chose to use the push key, but there's always many means to the same end.

Make sure you add the observer into the `boot()` function of the `AppServiceProvider.php` file:

```
     /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        FireSync::observe(FireSyncObserver::class);
    } 
```

Further expansion on this principle would be to include functions that clone an existing model with data to Firebase and to re-base the entire model if things go out of sync. But as a general concept this could be very useful in future.
