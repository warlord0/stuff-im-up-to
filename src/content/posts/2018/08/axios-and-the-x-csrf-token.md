---
pubDatetime: 2018-08-01T08:11:58Z
title: "Axios and the X-CSRF-TOKEN"
tags:
  - "Laravel"
  - "Web"
  - "xhr"
heroImage: "/blog-media/2018/03/vue-laravel.png"
description: "When using Laravel it adds in some helpful headers to handle axios requests internally. But when it comes to sending requests externally you end up sending"
---
When using Laravel it adds in some helpful headers to handle axios requests internally. But when it comes to sending requests externally you end up sending them the common headers added by Laravel and any plugins you may have added. This typically includes the `X-CSRF-TOKEN` which your site uses to prevent [Cross Site Request Forgery](https://www.owasp.org/index.php/Cross-Site_Request_Forgery_(CSRF)). But you don't really want to send that out to external axios calls and in fact I've struggled as the sites I was using axios with returned a browser error because of it not being listed in their allowed headers:

    SEC7123: Request header x-csrf-token was not present in the Access-Control-Headers-List.

    SCRIPT7002: XMLHttpRequest: Network Error 0x8007005, Access is denied.

In order to resolve this you need to remove the headers from your axios call. To do this I created a new instance of axios and returned that as my axios function.

    let instance = this.$http.get(url, {
      transformRequest: function(data, headers) {
        delete headers.common['X-CSRF-TOKEN']
        delete headers.common['Authorization']
      }
    })
    return instance

I also added into here the removal of the `Authorization` header as that too should not go outside, and failed with the same message.
