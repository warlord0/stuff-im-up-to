---
pubDatetime: 2018-07-26T13:01:22Z
modDatetime: 2018-08-01T19:12:55Z
title: "Vuetable-2"
tags:
  - "Bootstrap"
  - "JavaScript"
  - "vue.js"
  - "Web"
description: "Previously I've used Datatables.net to build my tables on the Laravel blade templates for user interface. Now I've been migrating over to Vue.js I thought"
---
Previously I've used Datatables.net to build my tables on the Laravel blade templates for user interface. Now I've been migrating over to Vue.js I thought I'd look at another option - more Vue.js centric. This is where [vuetable-2](https://www.npmjs.com/package/vuetable-2) (*not to be confused with other vue components of a similar name!*) came in. I tried a lot of other vue tables and most of them had a dependency for jQuery. I really wanted one that didn't use jQuery - I know Bootstrap has it as a dependency, but if I ever decide to remodel the UX using something like Material Design, I'd have no need to include jQuery. As a component I needed to do a lot of work to configure it to work with my setup. But only really because I wanted it to work with Bootstrap 4 and fontawesome. So I had to build vue component templates that presented me with the correct structure and classes for the pagination and search.

> The examples in the Gists relate to my admin interface to manage a Laravel user model of users and roles.

(see [gists below](#gists))

## JWTAuth

Then I ran into a problem with fetching data. Vuetable default Axios call to retrieve data to populate the table meant that no Authorization header was being sent. The default property for the vuetable `api-url` uses Axios, but obviously a different instance to the Vue plugin, as it doesn't include the `@websnova/vue-auth` component. The resolution was simple. Add a property to use your own http-fetch function, but just use the defaults, no need to add anything as effectively using `this.http$` uses the Vue plugin Axios instance that includes the `@wesanova` parts.

    api-url="myApi"
    :http-fetch="getData"

Then add a matching method, but do nothing special:

     getData(apiUrl, httpOptions) {
       return this.$http.get(apiUrl, httpOptions)
    },

## Gists

https://gist.github.com/warlord0/82209b928dbe7f2057d04eb6518d6084
