---
pubDatetime: 2022-05-20T07:52:41Z
modDatetime: 2022-05-20T07:54:53Z
title: "tmux"
tags:
  - "Linux"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "Terminal Multiplexer, it's like screen ++ I generally use screen when running detached processes, been doing so for a long time and switching to tmux is go"
---
Terminal Multiplexer, it's like `screen`++

I generally use screen when running detached processes, been doing so for a long time and switching to `tmux` is going to take some doing. New keystrokes to learn.

|            |                           |
|------------|---------------------------|
| **CTRL+B** | **Action**                |
| S          | List Sessions             |
| W          | List Windows              |
| D          | Detach Current Session    |
| X          | Close the Current Pane    |
| ?          | Help                      |
| %          | Split Window Vertically   |
| "          | Split Window Horizontally |

With `CTRL+B, W` you can scroll the list of attached and detached sessions and join them with `ENTER` or close them with `X`.

Detach a session and leave it running like `screen` using `CTRL+B, D` and come back to it using `CTRL+B, W` to show the windows and choose the one you detached.

One import thing I had to do was enable my mouse so I could use the wheel for scrolling. By default, the mouse scrolls command history, I need it to scroll the screen.

```
echo "set -g mouse on" >> ~/.tmux.conf
```
