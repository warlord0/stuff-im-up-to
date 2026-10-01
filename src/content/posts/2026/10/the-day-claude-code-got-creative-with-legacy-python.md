---
pubDatetime: 2026-10-01T09:53:47Z
title: "The Day Claude Code Got Creative With Legacy Python"
tags:
  - "ai"
  - "claude"
  - "python"
  - "docker"
  - "vagrant"
heroImage: "/blog-media/2026/10/claude-header.webp"
heroThumb: "/blog-media/2026/10/claude-thumb.webp"
description: "My code is modern Python with strict typing that needs 3.10+. The targets were a fleet of field devices stuck on Python 3.6, no internet access, and a main application that depends on that 3.6 staying exactly as it is. Here's how Claude Code talked its way out of that corner - and how it proved the plan worked before I let it near a real device."
---

Just about everyone writing software these days uses AI, me included. Most days I write very little code myself — I'm mostly reviewing what the AI has written. My projects are predominantly Python, with JavaScript and HTML on the frontend. AI has a very good handle on the frameworks and coding style I use, and I've given it rules on standards, linting and security checks to follow. But today's challenge wasn't about writing code at all. It was about delivering it.

The code in question is modern Python with strict typing, using language features that need Python 3.10 or newer. The problem is the targets: a fleet of field devices stuck on Python 3.6. Not a chance my code would run there without rewriting half of it.

This is where [Claude Code](https://claude.com/claude-code) got creative. I set it the challenge, and it started working out how to make the app run without touching a line of code, on systems with no internet access to pull anything from, and no way to install a newer Python even if they could reach the internet. The Python 3.6 already on those boxes runs the main application the device depends on — so that absolutely couldn't be touched either.

The clever part was how it worked out a way to run Python 3.12 without installing it at all. It pulled down a self-contained build that runs standalone from its own folder, then added the precompiled wheels the app needed. It didn't build anything — it assembled pre-built components, then had us copy the assembled Python straight onto a remote system and run it.

Once it had a runnable Python, it used it to create a virtual environment for the app. It had a plan — but a plan needs testing, and this is the part that properly impressed me. It spun up a Docker container running the same OS as the remote devices and tested the whole plan inside it. I watched it work: it had to install things like `systemd` into the container, hit a few walls, and kept going until it worked.

Then I mentioned I had Vagrant and libvirt available, and it got more interesting. Rather than a container, it built an actual virtual machine — same OS as the target devices, already running `systemd`, much closer to the real thing. All it had to do then was replicate the directory structure, drop in the assembled Python and the app, and test it there instead.

It did all of this in an afternoon. We went on to deliver it to twenty remote devices over SSH, without a hitch. I reckon that would have taken me the best part of a week by hand — and that's assuming I'd worked out the Python-assembly trick myself in the first place, which I'm honestly not sure I would have.

If you want the actual how-to behind the Python assembly trick — the runtime, the offline wheelhouse, and the Ansible role that pushes it all over an existing SSH connection — I wrote that up separately: [Running Python 3.12 on Ubuntu 18.04 without touching apt](/posts/running-python-3-12-on-ubuntu-18-04-without-touching-apt/).
