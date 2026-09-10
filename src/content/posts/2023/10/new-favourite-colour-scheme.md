---
pubDatetime: 2023-10-09T13:39:22Z
modDatetime: 2023-10-12T08:29:17Z
title: "New Favourite Colour Scheme"
tags:
  - "Linux"
heroImage: "/blog-media/2023/10/purple.png"
description: "Tokyo Night After installing neovim I installed an IDE config from here . This made using vi/vim a whole lot better. Neovim gets themed with a colour schem"
---
## Tokyo Night

After installing [neovim](https://neovim.io) I installed an IDE config from [here](https://github.com/LunarVim/Launch.nvim). This made using vi/vim a whole lot better. Neovim gets themed with a colour scheme called [Tokyo Night](https://github.com/folke/tokyonight.nvim). It's a purple based theme, and I do like purple. I then thought wouldn't it be nice if I could use the same colour scheme in my terminal ([Tilix](https://gnunn1.github.io/tilix-web/))?

I first set about trying to copy/paste colours into a profile to make a scheme myself. It was then that I realised Tokyo Night already had a scheme for tilix under its extras folder!

[https://github.com/folke/tokyonight.nvim](https://github.com/folke/tokyonight.nvim)

Copy the JSON files from the `extras/tilix` folder to `/usr/share/tilix/schemes` folder and they become available in a drop-down in the profile colour editor.

```
sudo cp tokyonight.nvim/extras/tilix/tokyonight_*.json /usr/share/tilix/schemes
```
