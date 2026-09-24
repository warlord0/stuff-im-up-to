---
pubDatetime: 2026-09-24T17:57:30Z
title: "Installing Windows 11 Home: A Rant"
tags:
  - "Windows"
  - "privacy"
heroImage: "/blog-media/2026/09/windows-recovery-header.webp"
heroThumb: "/blog-media/2017/12/windows-icon-thumb.webp"
description: "Installing Windows 11 Home for my nephew turned into a fight over a mandatory Microsoft account, a fake choice about advertising, a desktop full of promotional junk, and an idle system already burning through RAM before I'd opened a single app. The Linux install it wasn't."
---

Following on from [recovering a Windows PC with no password and no product key](/posts/windows-pc-no-password-no-key/), I actually had to sit through the install. When you install Linux, it's roughly: what language do you want, where do you want it, and how much other stuff do you want on top? Windows, in Home edition at least, goes rather differently.

> **Windows:** Would you like personalised advertising?
>
> **Me:** Erm, can I choose no advertising?
>
> **Windows:** No, we just won't make it obvious we're tracking you.
>
> **Me:** ...
>
> **Windows:** Oh, and you'll need a Microsoft account. That way we really get to know you.
>
> **Me:** Wait, what? I just want to work with software I paid for, not have my system connected to all kinds of things I don't need.
>
> **Windows:** Sorry, you're gonna have to have a Microsoft account.
>
> **Me:** Hmm, I don't think so. `Shift+F10`. `oobe\bypassnro`.
>
> **Windows:** Oooh, yeah, that'll work - if you haven't already connected to Ethernet or Wi-Fi. You did skip that, didn't you?
>
> **Me:** Damn it.

## The Account You Didn't Ask For

Windows 11 Home's setup (OOBE, in Microsoft's own terms - Out-Of-Box Experience) wants you online and signed into a Microsoft account before it will let you anywhere near a desktop. There's no "offline account" button sitting in plain sight the way there used to be; it's been removed, buried, or made to only appear under specific conditions depending on the build.

The workaround, as of writing, is:

1. At the network or account screen, press `Shift+F10` to open a command prompt.
2. Type `oobe\bypassnro` and press Enter.
3. The machine reboots back into setup, and this time a "I don't have internet" option (and, after that, "Continue with limited setup") actually appears.

The catch, which is exactly the mistake I made: this has to be done **before** you connect to a network at all. Setup remembers the SSID and password you gave it and reconnects automatically on the next pass through, so as far as it's concerned it's still online - the "I don't have internet" option simply never appears, `bypassnro` or not. Disconnecting Wi-Fi at that point doesn't help either, since the credentials are already cached; the only way out is to restart the whole install from scratch and run the bypass before connecting to anything. Microsoft has also reshuffled or restricted this trick across different Windows 11 builds before, so treat it as "works today," not a permanent guarantee.

## A Choice That Isn't Really One

Partway through setup there's a privacy screen: location, Find My Device, diagnostic data, "tailored experiences," and an option about using your advertising ID so that "ads are more interesting." You can switch every one of them off right there. It makes remarkably little difference to what you actually see once you're on the desktop.

## What Actually Ships On the Desktop

Once you're in, Windows 11 Home doesn't feel like a blank canvas:

- **Start menu recommendations** - a "Recommended" section that isn't your files or apps, it's promotional content.
- **Pinned tiles for apps you never installed** - things like TikTok, Spotify or Disney+ sitting on the Start menu; they're Store shortcuts rather than actually installed, but a fresh install shouldn't have opinions about what streaming service I use.
- **Lock screen ads** - Windows Spotlight, which is nominally "a nice photo," also carries "learn more" prompts for whatever it's currently promoting.
- **OneDrive backup prompts** - click through this too quickly and Documents, Desktop and Pictures get silently redirected into OneDrive rather than staying as plain local folders.
- **Widgets and Copilot**, pinned to the taskbar by default, both assuming you want a Microsoft account and an internet connection feeding them constantly.
- **Teams**, the consumer version, pre-installed and often set to start with Windows, whether or not you use it.

None of this is a bug. It's the default, deliberately.

## An Idle System Already Working Hard

Open Task Manager on a fresh install, before running a single application, and it's already doing a noticeable amount: Widgets, search indexing, OneDrive, Runtime Broker, the Antimalware Service Executable, and Windows' own background telemetry and update-orchestration services all show up. A fresh Linux desktop, doing the equivalent amount of nothing, generally sits a good deal lighter. It's not that Windows can't be made to behave - it's that "not much running yet" and "not much memory used" aren't the same thing here.

## What I Actually Did About It

For what it's worth, all of this is Settings-app reachable, no registry surgery required:

- **Settings → Privacy & security → General** - turn off the advertising ID and the rest of the tracking toggles again; they don't always stick from the OOBE screen.
- **Settings → Personalization → Start** - turn off "Show recommendations for tips, shortcuts, new apps, and more."
- **Settings → Personalization → Taskbar** - turn off Widgets and Copilot if you don't use them.
- **Settings → Apps → Installed apps** - uninstall the shortcuts you don't want; most of the "pre-installed" ones are just Store links and vanish cleanly.
- **Settings → Accounts → Windows Backup** - unlink OneDrive folder backup if you'd rather keep Documents and Desktop as plain local folders.

It gets Windows to somewhere reasonable. It shouldn't need doing at all.

For anyone wondering why I went through this rather than just handing over a nice, quiet Linux install: the school my nephew's off to is very Microsoft-orientated, so as much as I'd have preferred it, Linux wasn't really on the table this time.
