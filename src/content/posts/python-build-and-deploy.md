---
pubDatetime: 2022-01-27T21:55:26Z
title: "Python Build and Deploy"
tags:
  - "python"
  - "Uncategorized"
heroImage: "/blog-media/2021/01/python.png"
description: "We wanted a way of delivering passive status updates from our dockers to the Icinga2 API. I've used bash scripts for this in the past with curl, but figure"
---
We wanted a way of delivering passive status updates from our dockers to the Icinga2 API. I've used bash scripts for this in the past with curl, but figured python would be a better tool to use as it has access to the docker API using the docker module.

Ok, so I wrote some simple code, but do I just stick the `.py` files on the servers and let them run like that? That seems a bit raw to me, so how do I package things properly. There are a lot of ways to do it, but I found this article did the job for me.

[https://medium.com/nerd-for-tech/how-to-build-and-distribute-a-cli-tool-with-python-537ae41d9d78](https://medium.com/nerd-for-tech/how-to-build-and-distribute-a-cli-tool-with-python-537ae41d9d78)

There are some things I don't understand fully, but I got my code and class delivered in a simple manner that means I can just call it like any other executable.

A simple `pip3 install my,whl` and I can run it.
