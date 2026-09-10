---
pubDatetime: 2016-12-05T21:24:35Z
modDatetime: 2016-12-05T21:25:45Z
title: "CBR-Manager"
tags:
  - "electron"
  - "JavaScript"
  - "node.js"
  - "Privateer"
  - "Web"
heroImage: "/blog-media/2016/11/screenshot-from-2016-11-29-083649.png"
description: "So far I'm really impressed with how the development is going with Electron. I've been able to sort out some frustrating situations to the extent where I'm"
---
So far I'm really impressed with how the development is going with Electron. I've been able to sort out some frustrating situations to the extent where I'm now uploading the code to [GitHub](https://github.com/)

## Project Link

[https://github.com/warlord0/cbr-manager/wiki](https://github.com/warlord0/cbr-manager/wiki)

### Curse of the CallBack!

I've said before that Node.js is very different and one big gotcha had me spending hours pouring over the code to resolve a problem. It all revolved around the asynchronous way the code I was writing was working. Well, more specifically the way I was misunderstanding how it should have been working. I found myself using a mixture of synchronous and asynchronous code to the point where a routine would run asynchronously and be changing variables within my asynchronous loop causing all kinds of unwanted behaviour. I learnt that not everything should be asynchronous. It's great for where it's needed but occasionally you have to wait for a result before you continue processing. A while loop is a good place to rethink this. If you end up in a callback using a callback you could be out of your loop and into the nextTick without the information you're actually waiting for. Imagine calling a loop that carries out a task 10 times, but doesn't wait for each task to finish. But within that loop you use a variable within the task. If your task changes that variable as part of it's workings you'll find the variable used by the next task could be different to what you intended as each task may be running for a different length of time and therefore not in the sequence you'd expect!
