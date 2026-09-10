---
pubDatetime: 2024-10-04T08:46:21Z
title: "Fish and Node.js"
tags:
  - "JavaScript"
  - "Linux"
  - "node.js"
  - "programming"
  - "tools"
  - "web-development"
heroImage: "/blog-media/2016/11/images-duckduckgo-com-e1479333489433.png"
description: "Today, I was installing a boilerplate project that uses Node.js on an Ubuntu 24.04 LTS box. I didn't want to use the Ubuntu version of Node.js, it's usuall"
---
Today, I was installing a boilerplate project that uses Node.js on an Ubuntu 24.04 LTS box. I didn't want to use the Ubuntu version of Node.js, it's usually better to install these things direct from the source.

The installation routine from Node.js looks like this;

```
# installs nvm (Node Version Manager)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.0/install.sh | bash
# download and install Node.js (you may need to restart the terminal)
nvm install 20
# verifies the right Node.js version is in the environment
node -v # should print `v20.18.0`
# verifies the right npm version is in the environment
npm -v # should print `10.8.2`
```

But it fails because the call to `nvm` fails. Fish doesn't like it. I found these instructions to get it working:

<https://dev.to/ryunosukezoran/how-to-set-up-nvm-to-work-with-fish-shell-2bho>

But the problem here looks like a copy and paste translation of the single quotes. Make sure you end up with the correct single quote. Also, use `fisher install` NOT `add`.

Install `fisher`

```
curl https://git.io/fisher --create-dirs -sLo ~/.config/fish/functions/fisher.fish
```

Install the `bass` extension

```
fisher install edc/bass
```

Edit `~/.config/fish/functions/nvm.fish` and add the content (pay attention to the quotes)

```
function nvm
    bass source ~/.nvm/nvm.sh -- no-use ';' nvm $argv
end
```

Now, you can go back to install Node.js using `nvm`.
