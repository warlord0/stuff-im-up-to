---
pubDatetime: 2021-03-03T15:20:31Z
modDatetime: 2026-09-18T12:43:46Z
title: "zsh antigen"
tags:
  - "bash"
  - "Linux"
heroImage: "/blog-media/2021/03/zsh_logo-1.webp"
heroThumb: "/blog-media/2021/03/zsh_logo-1-thumb.webp"
description: "Manage zsh the intelligent way. Install curl -L git.io/antigen > ~/antigen.zsh Configure ~/.zshrc source ~/antigen.zsh # Load the oh-my-zsh's library. anti"
---
Manage zsh the intelligent way.

### Quick Setup

When I first connect to a new system, this single block does everything in one paste: installs antigen, writes the `.zshrc` below, and makes zsh the shell that launches automatically whenever bash starts an interactive session (without touching the account's actual login shell).

```bash
curl -L git.io/antigen > ~/antigen.zsh &&
cat > ~/.zshrc <<'EOF'
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
source ~/.antigen/bundles/zsh-users/zsh-autosuggestions/zsh-autosuggestions.zsh

# autocorrect
setopt correct

# Tell Antigen that you're done.
antigen apply
EOF
grep -qF 'exec zsh' ~/.bashrc || awk '
/^esac$/ && seen_case {
    print
    print ""
    print "if [[ $- == *i* ]] && command -v zsh >/dev/null 2>&1; then"
    print "    exec zsh"
    print "fi"
    next
}
/^case \$- in$/ { seen_case=1 }
{ print }
' ~/.bashrc > ~/.bashrc.tmp &&
mv ~/.bashrc.tmp ~/.bashrc
```

The `awk` at the end is doing the fiddly part: it finds the `case $- in ... esac` block that most distros' default `.bashrc` uses to check whether the shell is interactive, and inserts the `exec zsh` right after it closes — so it only fires for interactive sessions, not when bash is invoked non-interactively (scp, rsync, some CI runners, etc., which would break if a shell startup file suddenly printed anything or exec'd into zsh unconditionally). The `grep -qF` guard makes it safe to paste more than once without duplicating the block.

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
source ~/.antigen/bundles/zsh-users/zsh-autosuggestions/zsh-autosuggestions.zsh

# autocorrect
setopt correct

# Tell Antigen that you're done.
antigen apply
```
