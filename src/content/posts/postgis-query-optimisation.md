---
pubDatetime: 2019-03-01T13:48:08Z
modDatetime: 2019-03-01T19:35:17Z
title: "PostGIS Query Optimisation"
tags:
  - "Linux"
  - "postgis"
  - "postgresql"
description: "I started to do some work on how efficient the spacial SQL queries I was using are. That meant looking at the indexing that is used on the geometry column"
---
I started to do some work on how efficient the spacial SQL queries I was using are. That meant looking at the indexing that is used on the geometry column and understanding the functions I used a bit more.

I made a simple change from using `ST_Contains` to `ST_Within` and made a tenfold increase in the performance of my query. Similarly with a change from `ST_Distance` to `ST_DWithin`.

Now if only I read the documentation more!

> Prior to 1.3, ST_Expand was commonly used in conjunction with && and ST_Distance to achieve the same effect and in pre-1.3.4 this function was basically short-hand for that construct. From 1.3.4, ST_DWithin uses a more short-circuit distance function which should make it more efficient than prior versions for larger buffer regions.
>
> [https://postgis.net/docs/ST_DWithin.html](https://postgis.net/docs/ST_DWithin.html)
