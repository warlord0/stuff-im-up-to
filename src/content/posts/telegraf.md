---
pubDatetime: 2022-03-16T15:29:38Z
modDatetime: 2022-04-01T09:31:03Z
title: "Telegraf"
tags:
  - "influxdb"
  - "Uncategorized"
description: "This is stupid. I'm trying to use telegraf to collect stats from postgresql. I want to use the input plugin postgresql_extensible and output the data to In"
---
## This is stupid.

I'm trying to use telegraf to collect stats from postgresql. I want to use the input plugin `postgresql_extensible` and output the data to InfluxDB v2 using the output plugin `influxdb_v2`. Sounds reasonable enough.

> How do you install a Telegraf plugin?

Search all you like, the answer is not obvious.

> You don't need to install plugins as Telegraf will look at its online repository and use them dynamically from there!

When I was getting an error in my config and wasn't sure if it was a config or plugin error, I spent ages looking for how to debug the issue - first by finding out where the non-working plugin was installed. ***Don't do this.***
