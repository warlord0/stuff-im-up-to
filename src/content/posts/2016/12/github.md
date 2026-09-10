---
pubDatetime: 2016-12-12T08:28:17Z
modDatetime: 2016-12-12T21:58:49Z
title: "Github"
tags:
  - "git"
  - "Privateer"
  - "Web"
heroImage: "/blog-media/2016/12/octocat.png"
description: "I've had a few little dealings with Github in the past as a contributor, but thought as I'm working on a project that borrows from a lot of code that is \"s"
---
I've had a few little dealings with Github in the past as a contributor, but thought as I'm working on a project that borrows from a lot of code that is "sociably" hosted on Github by many Open Source developers, I thought I'd take the opportunity to put something back.

### So what is Github?

It's a location for Gits! So more importantly what is Git? Git is a version control mechanism that allows you to manage and maintain a folder structure, recording and monitoring changes as you develop. So Github is an online repository to publish your Gits. Once published the whole world can see your code and your changes. Not only that they can clone your work, make changes and submit the changes back to you for inclusion in your project. You can use Git in Windows or Linux. Windows has a nice GUI and command line version that let's you see what you've changed. Linux is just a command line, which is just fine by me.

### Quick start

    $ git init

This makes the current directory monitored by git. It creates a .git subfolder to hold all the tacking info in.

    $ git add [file/folder]

Add files or folders to be monitored by git

    $ git commit -m "[A note about the changes I've just made]"

Submit all the changes since the last commit as a block of monitored changes.

    $ git push

Submit your git up to a remote/online repository like Github.

    $ git clone [https://repository/project]

Clone a repository project down to your system. So you can now have a complete copy of the source code of the online project to work on yourself. Reference: [http://gitref.org/](http://gitref.org/)

### Atom & Git

One really, really great thing about git is that the Atom IDE is git aware. So as you're editing files in Atom you'll see the files in the tree become colour coded to indicate their status ie. green for a new file, amber (yellow) for a modified file, dark grey for an ignored file. It even applies the same colour coding on a line by line basis of the file you're editing. So you can see new lines, changed lines and a little red marker for where a line was deleted.
