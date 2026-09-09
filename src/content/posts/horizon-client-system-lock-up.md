---
pubDatetime: 2021-03-12T16:38:04Z
modDatetime: 2021-03-12T16:38:31Z
title: "Horizon Client System Lock Up"
tags:
  - "Linux"
  - "vmware"
  - "Windows"
description: "For the past few week I've had a really frustrating time dealing with a customer system. Initially I put it down to me moving to Manjaro and the VMWare Hor"
---
For the past few week I've had a really frustrating time dealing with a customer system. Initially I put it down to me moving to Manjaro and the VMWare Horizon client having some issue. So I installed on my Debian laptop and still the same issue.

This was really frustrating as when using the remote guest I'd hit what I thought was a particular keystroke and all of a sudden the system would freeze. What was worse was it also really screwed up my local Linux. Menu's would drop when clocked, terminal windows couldn't be type in, the keyboard seemed frozen.

I was only today when I had a lot of work to do for the client that I found what triggered it.

I'm using putty in a Windows remote guest and hit tab to autocomplete, system locked. Next time again in putty press home, system locked. Press end, system locked. But what I noticed was "**ding!**". When the putty bell rings it kills my system. Surely not?

> Well I went into the putty settings and disabled the bell. Job done, been working on it all day and no lock ups.
