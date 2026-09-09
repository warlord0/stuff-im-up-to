---
pubDatetime: 2020-01-14T17:27:17Z
modDatetime: 2020-03-20T10:07:06Z
title: "vi"
tags:
  - "Linux"
description: "I've been using vi for ages and about my limit is search and replace. Here's a place for some magic I've been picking up more recently. When you've forgott"
---
I've been using vi for ages and about my limit is search and replace.

Here's a place for some magic I've been picking up more recently.

When you've forgotten to open the file with `sudo` and still need to save your changes:

```
:w !sudo tee %
```

Grab the result of a shell command and place the results at the cursor, eg.

```
:r !date
```

Disable the annoyance that is [visual mode](https://warlord0blog.wordpress.com/2018/02/15/vi-visual-mode/) by adding this into `~/.vimrc`

```
set mouse-=a
filetype indent plugin off
```

Block editing = CTRL+V, highlight the block and hit DEL or use insert

Goto End of document = G

Undo = u

Delete Line = dd

Paste = p

#### CTRL + S Locks Session

This is a common mistake for me. I press CTRL+S and the session locks up. Unlock it with CTRL+Q

Add this into `.bashrc` or `.bash_profile`.

```
stty -ixon
```

References - [https://unix.stackexchange.com/a/72092](https://unix.stackexchange.com/a/72092)
