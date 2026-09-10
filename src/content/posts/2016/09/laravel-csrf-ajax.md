---
pubDatetime: 2016-09-08T19:19:27Z
modDatetime: 2016-09-19T19:53:41Z
title: "Laravel CSRF & $.ajax()"
tags:
  - "ajax"
  - "csrf"
  - "JavaScript"
  - "jquery"
  - "Laravel"
  - "Security"
heroImage: "/blog-media/2016/09/jquery_logo.png"
description: "Laravel has a nice built in feature to prevent Cross Site Request Forgeries. In each form you simply drop in a {{ csrf_field() }} and you end up with an _t"
---
Laravel has a nice built in feature to prevent Cross Site Request Forgeries. In each form you simply drop in a {{ csrf_field() }} and you end up with an \_token field that Laravel sniffs out on each submission. If it doesn't match the sent token the submission fails. I was trying to use JQuery and retrieve data and faced the problem that my token never matches as my \$.ajax() command was not sending it. There's more than one way to skin a cat. You need to get the \_token parameter into the \$.ajax() request. You can either use blade to write it into your JavaScript, fetch it using a JQuery selector or probably the easiest way make it part of the \$.ajax() call by default.

    $.ajaxSetup({
        headers: {
            'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
        }
    });

If you use the standard Laravel layout.app view the csrf-token is embedded into the HTML header and can therefore be fetched as above. But you could also add it to the \$.ajax() data:

    data: {
        id: $('#something').val(),
        _method: 'post',
        _token: $("meta[name=csrf-token]").attr("content")
    },

You'll notice by including an \_method I can also use spoofing to the method I want to call. This could be anything like POST, PUT, PATCH etc. If it's not in your header you can fetch it from your form, as long as you used the {{ csrf_field() }} helper.

    _token: $('[name=_token]').val();
