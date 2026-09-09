---
pubDatetime: 2016-09-11T19:40:04Z
modDatetime: 2016-10-12T19:27:00Z
title: "It's getting late"
tags:
  - "carbon"
  - "JavaScript"
  - "Laravel"
  - "moment.js"
  - "php"
description: "But how late is it? When it comes to messing with dates, times and duration there's a lot of pitfalls. Again, don't reinvent the wheel use some one elses g"
---
But how late is it? When it comes to messing with dates, times and duration there's a lot of pitfalls. Again, don't reinvent the wheel use some one elses great works.

### JavaScript

In JavaScript it comes in the form of [moment.js](http://momentjs.com/). Anything you need to do with a date and time in JavaScript this is the place to start. It helps parsing and formatting as well as any calculations you need. eg.

    var first_date = moment(),
        second_date = first_date.add(7, 'days');

    if (first_date.isBefore(second_date)) {
    ...
    }

### PHP

On the PHP side [Carbon\Carbon](http://carbon.nesbot.com/) is an essential class. So much so Laravel comes with it. One quirk I had to get my head around was that it creates and object. If you manipulate it with .addDay() because you want to get a second date you'll find the first date has changed. eg.

    use Carbon\Carbon;

    $first_date = new Carbon\Carbon::now();
    $second_date = $first_date.addDays(7);

You find that both \$second_date and \$first_date are now equal to the same date - 7 days from today! So the correct way to achieve this was to make a copy of the first date.

    $first_date = new Carbon\Carbon::now();
    $second_date = $first_date->copy().addDays(7);
