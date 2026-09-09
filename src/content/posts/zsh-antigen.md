---
pubDatetime: 2021-03-03T15:20:31Z
modDatetime: 2021-06-12T16:40:13Z
title: "zsh antigen"
tags:
  - "bash"
  - "Linux"
description: "Manage zsh the intelligent way. Install curl -L git.io/antigen > ~/antigen.zsh Configure ~/.zshrc source ~/antigen.zsh # Load the oh-my-zsh's library. anti"
---
Manage zsh the intelligent way.

### Install

```
curl -L git.io/antigen > ~/antigen.zsh
```

### Configure

#### ~/.zshrc

```
source ~/antigen.zsh

# Load the oh-my-zsh's library.
antigen use oh-my-zsh

# Bundles from the default repo (robbyrussell's oh-my-zsh).
antigen bundle git
antigen bundle docker
antigen bundle docker-compose
antigen bundle command-not-found

# Syntax highlighting bundle.
antigen bundle zsh-users/zsh-syntax-highlighting

# Load the theme.
antigen theme ys

# autosuggest
antigen bundle zsh-users/zsh-autosuggestions
source .antigen/bundles/zsh-users/zsh-autosuggestions/zsh-autosuggestions.zsh

# autocorrect
setopt correct

# Tell Antigen that you're done.
antigen apply
```
