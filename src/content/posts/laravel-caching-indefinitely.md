---
pubDatetime: 2019-06-28T07:55:01Z
modDatetime: 2019-06-28T12:28:44Z
title: "Laravel Caching Indefinitely"
tags:
  - "Laravel"
  - "php"
  - "Web"
description: "I recently attended the Laravel UK conference and learned a lot of very useful things. One of them related to a caching methodology being used for data tha"
---
I recently attended the Laravel UK conference and learned a lot of very useful things. One of them related to a caching methodology being used for data that rarely changes.

Up until now I'd been taking best guesses to how long to cache data for on a case by case basis. In one particular example I reckoned 8 hours was about right as the data only really changed once every 3 months or less.

This still caught me out as on the day the user did change the underlying data the api call was still responding with cached data and would do so until the 8 hours expired. The user experience then meant they'd need to wait until tomorrow before others would see they'd made a change.

This wasn't ideal. So how do we best satisfy the users with up to date data?

The suggestion was simply to invalidate the cache when a user updates the data. Which makes sense, but then why only cache for 8 hours if we're going to invalidate it on change? Let's cache the data forever or indefinitely then. That way users are always getting fast data from a memory cache that is always up to date.

Let's take it one step further. If we invalidate the cache on update/change, then let's pre-populate the cache without waiting for an end user to visit. This way every end user visit gets cached data.

### Implementation in Laravel

Caching of data forever is a native Laravel cache feature and easy to implement. What we also want to do is only invalidate specific key-value pairs that relate to the data set we have affected. We don't want to simply clear/flush the entire cache. Let's make sure we only clear the cached data that changed.

Initially I looked at trying to clear the cache using a wildcard on the key names. Laravel have already thought of this and instead of using the key name you can tag cache entries and then flush all entries with that tag or tags.

```
public function getCostCentres() {
  return \Cache::tags(['costcentres'])
    ->rememberForever('api.costcentres', function () {
      
    $costcentres = CostCentres::select('costcentre', 'description')
      ->orderBy('costcentre')
      ->get();

    return $costcentres;
  });
}
```

This is typical of the api call in our controller and you can see we return the cached item with a key of 'api.costcentres' that is tagged as 'costcentres' which we remember forever.

Now we need to ensure that when an update to the 'costcentres' model happens that we invalidate/flush that entry from the cache using:

```
\Cache::tags(['costcentres'])->flush();
```

We could place this into the controller within any of our create, store or update functions. But what if the model were updated outside of our controller from some other aspect of the application?

To capture this kind of change we need to use events. Thankfully Laravel has a number of built in events that get triggered which we can make use of.

In our environment we're still using Laravel 5.5 and the events are documented here <https://laravel.com/docs/5.5/eloquent#events>

Newer versions have the same events, but actually are better supported with artisan make.

The events we're looking for are `created`, `updated`, `saved` and `deleted`. When any of these Eloquent events happen we want to clear the cache.

You could add in the calls to events into the models `protected $dispatchesEvents` variable and write your own classes to handle them, but I found it best to create an observer and handle the events in one place.

```
<?php

namespace App\Observers;

use App\Finance\CostCentres;

/**
 * Boot this class in AppServiceProviders
 * This will fire the functions based on the matching eloquent event names
 * The aim of this is to clear the matching tagged cache keys when using 
 * indefinite caching
 */

class CostCentreObserver
{
    /**
     * Listen to the Cost Centre created event.
     *
     * @param  App\Finance\CostCentres $costcentres
     * @return void
     */
    public function created(CostCentres $costcentres)
    {
        $this->clearCache();
    }

    /**
     * Listen to the Cost Centre updated event.
     *
     * @param  App\Finance\CostCentres $costcentres
     * @return void
     */
    public function updated(CostCentres $costcentres)
    {
        $this->clearCache();
    }

    /**
     * Listen to the Cost Centre deleting event.
     *
     * @param  App\Finance\CostCentres $costcentres
     * @return void
     */
    public function deleted(CostCentres $costcentres)
    {
        $this->clearCache();
    }

    private function clearCache() {
        \Cache::tags(['costcentres'])->flush();
        // Add in the pre-loading of the cache if required.
    }
}
```

Bootstrap this observer in `AppServiceProvider.php`

```
class AppServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        \Illuminate\Support\Facades\Schema::defaultStringLength(191);
        // Add an observer to watch for eloquent events on the CostCentres model
        CostCentres::observe(CostCentreObserver::class);
    }
```

Now when the events are called on the CostCentre model their matching function in the observer is triggered and the cache is flushed. No more code required in the controllers the observer will handle changes to the model for us.
