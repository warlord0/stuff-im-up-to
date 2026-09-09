---
pubDatetime: 2018-10-06T09:18:12Z
modDatetime: 2018-10-06T09:19:18Z
title: "Local Git Repository"
tags:
  - "atom"
  - "Linux"
  - "Windows"
description: "When working on a project at home I don't necessarily want to host my Git repo online and don't feel the need for installing a Gitlab server on my home network, but I do want to backup my projects to my cloud backup."
---
When working on a project at home I don't necessarily want to host my Git repo online and don't feel the need for installing a Gitlab server on my home network, but I do want to backup my projects to my cloud backup. I also would like to not backup all the vendor resources with my project. So I'd like to exclude the node_module folder and other `.gitignore` content. Whilst googling around I discovered I could just use a folder as a repo. Most people tend to do this onto a network file share, but my needs were simple. All I wanted to do was include my Git repo within the folders that are automatically backed up to the cloud. The current path for the development projects on my Windows machine is `c:\users\myuser\projects` which is outside of the folders I backup. So I need to create a repo within an backed up folder like "My Documents". Then when I push my commits into it the committed changes get backed up. Create a repository to host my commits - act as a remote repository

    c:> cd "c:\users\myuser\My Documents"
    c:> mkdir myproject.git
    c:> cd myproject.git
    c:> git init --bare --shared

This creates the empty remote. Set my projects remote repo to the newly created location

    c:> cd \users\myuser\myproject
    c:> git remote add origin file://"c:/users/myuser/My Documents/myproject.git"

Then we need to do a first time push up to our new remote master.

    c:> git push --set-upstream origin master

If this complains at this point check you have used the right path in the `file://`​ parameter. But you must also have at least one local commit to push up to the remote. If you've never committed before you should at least have run:

    c:> git commit -m "initial commit"

After carrying out a regular commit I make sure I do a git push so the remote files are updated. These are then backed up. I can now be worry free about losing my project work, as I can just `git clone` everything back into a working folder and rebuild from just my code:

    c:> git clone file://"c:/users/myuser/My Documents/myproject.git"

**Note**: Once the remote repo is setup I'll actually use Atom to manage commits and pushes so no need for the command line.
