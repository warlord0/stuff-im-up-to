---
pubDatetime: 2021-03-03T15:20:31Z
modDatetime: 2026-09-18T16:24:36Z
title: "zsh antigen"
tags:
  - "bash"
  - "Linux"
heroImage: "/blog-media/2021/03/zsh_logo-1.webp"
heroThumb: "/blog-media/2021/03/zsh-percent-thumb.webp"
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
zsh -c 'source ~/antigen.zsh; antigen use oh-my-zsh; antigen bundle zsh-users/zsh-syntax-highlighting; antigen bundle zsh-users/zsh-autosuggestions; antigen apply' &&
mkdir -p ~/.antigen/bundles/robbyrussell/oh-my-zsh/cache/completions
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

The `zsh -c` and `mkdir` lines after the `.zshrc` are there to avoid two errors on the very first start. The first one is this, which comes from the docker plugins trying to write their completions into a cache directory that doesn't exist yet:

```text
(anon):12: process substitution failed: no such file or directory
```

The fix is to create `~/.antigen/bundles/robbyrussell/oh-my-zsh/cache/completions`, but the order matters. Antigen only clones oh-my-zsh if its directory is missing, so creating that folder *before* antigen has run makes it think oh-my-zsh is already installed, and it never gets cloned. The `zsh -c` line lets antigen do its cloning first (it also fetches the syntax-highlighting and autosuggestions bundles), and only then is the `mkdir` run. That also removes the other first-run complaint, where the `source` line for `zsh-autosuggestions.zsh` fails because the bundle hasn't been downloaded yet. Both lines are safe to run again.

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
