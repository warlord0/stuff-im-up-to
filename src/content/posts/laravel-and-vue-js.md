---
pubDatetime: 2022-05-30T08:31:50Z
modDatetime: 2022-06-21T17:45:51Z
title: "Laravel and Vue.js"
tags:
  - "Laravel"
  - "Web"
description: "I tried to pick up where I left off with my Laravel skills. I began with some vuejs pages and wrote the api to feed the data to them using axios. It took m"
---
I tried to pick up where I left off with my Laravel skills. I began with some vuejs pages and wrote the api to feed the data to them using axios. It took me a while to get an authenticated version of the api's working. I added in bearer authentication using tokens, as I used to - then realised my single page experience wasn't so great.

I was clearly doing something wrong, as my navigation was loading pages when navigating. It worked, but didn't flow like I imagined it should when I developed an SPA previously.

At this point, I went back and started to look at the documentation properly. I learned that there's no need for axios (generally) as the proper way to do things is by using [Inertia](https://inertiajs.com)

> Inertia isn't a framework, nor is it a replacement to your existing server-side or client-side frameworks. Rather, it's designed to work with them. Think of Inertia as glue that connects the two.
>
> [https://inertiajs.com](https://inertiajs.com)

Things certainly have changed a lot.

I took out all of my axios code from my vues and added `props` to them instead. Then in my controllers I passed data as if I were sending it to a blade template. The data arrived in the `props` and I can then access it in my vues in the same way as I did before. What I found strange was you even take this same approach for what would previously be XHR requests - Inertia will make your regular non-API calls into XHR requests and update the `props` for you, effectively doing the API work for you.

This means inertia deals with all the security in the same was as it does for normal web controller functions. I get dynamically updated data, without the need to roll my own API's. The code in my vues almost disappeared as I don't need to do much in terms of API calls to update data for pagination etc.

The key changes for me were to return `Inertia:render()` rather than return `view()`. Then in any call I make to `POST` data do the same thing - return an Inertia response, or use `redirect)->back()`.

The key really is **[READ THE DOCUMENTATION](https://inertiajs.com)**!
