---
pubDatetime: 2026-09-14T10:00:00+00:00
title: "Kitty Terminfo"
tags:
  - "Linux"
  - "SSH"
  - "Terminal"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.webp"
heroThumb: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico-thumb.webp"
description: "If you've started using Kitty as your terminal emulator, you may eventually hit a particularly annoying problem when working over SSH: everything works fine as your normal user, but as soon as you sudo into another account, terminal applications start behaving strangely…"
---

## Kitty, SSH, sudo and the broken terminal: fixing missing terminfo

If you've started using Kitty as your terminal emulator, you may eventually hit a particularly annoying problem when working over SSH.

Everything works perfectly as your normal user, but as soon as you do:

```bash
sudo -i
```

or switch to another account with `sudo`, terminal applications start behaving strangely.

Some programs complain that the terminal is not fully functional. Others fall back to something like `ansi`, losing colours or key functionality.

The worst offender, in my experience, is `zsh` completion. You can start typing and suddenly get repeated characters, broken cursor movement, or generally unusable command-line editing.

The problem isn't really `zsh`.

It's **terminfo**.

## The PostgreSQL example

A particularly easy way to reproduce the problem is with PostgreSQL:

```bash
sudo -u postgres psql
```

On a system where the `postgres` account doesn't have access to Kitty's terminfo definition, `psql` may complain:

```text
psql: warning: terminal is not fully functional
```

The useful diagnostic is:

```bash
echo $TERM
infocmp $TERM
```

As your normal user, you might see:

```text
xterm-kitty
```

and `infocmp` works perfectly.

But:

```bash
sudo -u postgres infocmp $TERM
```

returns:

```text
infocmp: error: no match in terminfo database for terminal type "xterm-kitty"
```

The terminal hasn't changed.

`$TERM` hasn't changed.

**The user has.**

## What's going on?

Kitty identifies itself using the terminal type:

```bash
echo $TERM
```

On a local Kitty session you'll typically see:

```text
xterm-kitty
```

Kitty has its own terminfo definition, which describes the terminal's capabilities — things such as cursor movement, colours, function keys and various escape sequences.

When you connect to a remote machine using SSH, Kitty can make its terminal definition available to the remote system.

As your normal user, everything can therefore work perfectly:

```bash
$ echo $TERM
xterm-kitty

$ infocmp xterm-kitty
```

But when you run:

```bash
sudo -i
```

or:

```bash
sudo -u postgres psql
```

you are using a different account.

That account may not have access to the same terminfo database.

## Why does SSH work for my user but not another user?

Kitty stores terminal definitions in the user's terminfo directory.

A common location is:

```text
~/.terminfo/
```

For example:

```text
/home/paul/.terminfo/
```

Your normal user has access to that directory.

The `postgres` account has its own home directory and environment, and won't necessarily have the same terminfo files.

The same applies to root:

```text
/root/.terminfo/
```

So when you become root, or switch to another account, the terminal definition that was available to your normal user may no longer be available.

The terminal hasn't changed.

Your terminal emulator hasn't changed.

But the environment in which the program is running has.

## The proper fix: install Kitty's terminfo system-wide

Rather than copying `.terminfo` into every user's home directory, install the Kitty terminal definition system-wide.

First, export the definition:

```bash
infocmp xterm-kitty > /tmp/xterm-kitty.info
```

Then install it:

```bash
sudo tic -x -o /usr/share/terminfo /tmp/xterm-kitty.info
```

The `-x` option preserves extended terminal capabilities, which is important for Kitty.

The `-o` option specifies the system-wide terminfo directory.

After installation, test it:

```bash
infocmp xterm-kitty
```

Then test as another user:

```bash
sudo -u postgres infocmp xterm-kitty
```

If both commands work, you've fixed the problem system-wide.

Now:

```bash
sudo -u postgres psql
```

should no longer complain that the terminal is not fully functional.

And:

```bash
sudo -i
```

should give you a properly functioning Kitty terminal as root.

## Why not just copy `.terminfo` into `/root`?

My original workaround was:

```bash
sudo mkdir -p /root/.terminfo
sudo cp -a ~/.terminfo/. /root/.terminfo/
```

This works, but it is not ideal.

It fixes root while leaving other accounts with the same problem.

For example:

```bash
sudo -u postgres psql
```

would still fail if the `postgres` account didn't have its own copy.

Installing the definition system-wide is cleaner:

```text
/usr/share/terminfo/
└── x/
    └── xterm-kitty
```

Now root, postgres and other users can all access the same terminal definition.

No duplicated files.

No need to maintain separate copies.

## Diagnosing the problem

When troubleshooting this, compare the normal user and the account reached through `sudo`.

As your normal user:

```bash
echo $TERM
infocmp $TERM
```

Then:

```bash
sudo -u postgres sh
```

and:

```bash
echo $TERM
infocmp $TERM
```

If `$TERM` is still:

```text
xterm-kitty
```

but `infocmp` cannot find it, you've found the problem.

You can also inspect the terminfo search directories:

```bash
infocmp -D
```

This shows where the terminfo database is being searched.

On many Linux systems, `/usr/share/terminfo` is the appropriate system-wide location, but `infocmp -D` is useful if your distribution uses a different directory.

## What about `kitten ssh`?

Kitty provides its own SSH helper:

```bash
kitten ssh user@example.com
```

This makes remote Kitty sessions considerably nicer because Kitty can handle some of the terminal integration that ordinary SSH doesn't.

However, it doesn't automatically make the terminal definition available to every user on the remote machine.

You can have a perfectly functioning Kitty session as your normal account and still hit the problem after:

```bash
sudo -i
```

because you've changed users.

That's the key distinction.

## An alternative: use a more widely available `$TERM`

Another workaround is to use a terminal type that is already installed on virtually every Unix-like system, such as:

```text
xterm-256color
```

For example:

```bash
env TERM=xterm-256color kitten ssh user@example.com
```

This avoids depending on Kitty's specific `xterm-kitty` definition.

However, you're potentially giving up some of Kitty's terminal-specific capabilities.

For machines you administer, I'd rather have the remote system correctly understand that I'm using Kitty than deliberately downgrade the terminal description.

So I prefer installing the appropriate terminfo entry.

## Why zsh completion is particularly painful

Interactive shells such as `zsh` rely heavily on terminal capabilities for line editing.

Things that seem trivial — moving the cursor, deleting characters, redrawing a line, handling completion menus, moving through history — all involve terminal control sequences.

If the shell or the libraries it uses can't correctly determine those capabilities, the resulting behaviour can be spectacularly broken.

Typical symptoms include:

* Characters appearing twice
* Cursor movement behaving incorrectly
* Backspace doing strange things
* Completion menus not rendering correctly
* Escape sequences appearing on screen
* Applications falling back to a generic terminal such as `ansi`
* The command line becoming effectively unusable

This is why the problem can initially look like:

> "Kitty and zsh don't get along over SSH."

They do.

The missing piece is the terminal definition.

## The important lesson

This isn't really a Kitty bug, nor is it a zsh bug.

It's an interaction between:

1. **The terminal emulator** — Kitty
2. **SSH** — transporting the terminal session to another machine
3. **`$TERM`** — identifying the terminal
4. **terminfo** — describing its capabilities
5. **`sudo`** — changing the user/environment
6. **Interactive applications** — such as zsh, psql, vim and less

The normal user has the Kitty terminal definition.

Another account doesn't.

Installing the definition system-wide fixes that mismatch for everyone.

For me, the dead giveaway is when `sudo -i` suddenly turns a perfectly usable Kitty + zsh session into a terminal where tab completion starts producing duplicated characters and other bizarre behaviour.

That's when I stop blaming zsh and check:

```bash
echo $TERM
infocmp $TERM
```

If `infocmp` can't find the terminal definition, you've probably found your problem.

