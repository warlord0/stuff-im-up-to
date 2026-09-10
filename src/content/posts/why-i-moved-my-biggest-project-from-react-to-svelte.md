---
pubDatetime: 2026-07-07T13:57:22+00:00
title: "Why I Moved My Biggest Project from React to Svelte"
tags:
  - "Javascript"
  - "Web"
  - "Daisyui"
  - "Svlete"
  - "Tailwindcss"
heroImage: "/blog-media/2026/07/sveltekit-seeklogo.png"
description: "Over the past week I finally took the plunge and migrated one of my most ambitious projects from React to Svelte. It wasn't a decision I made lightly. The project is substantial, and migrating a codebase of that size isn't something you do on a whim. But after spending time building a few smaller applications…"
---
Over the past week I finally took the plunge and migrated one of my most ambitious projects from React to Svelte.

It wasn’t a decision I made lightly. The project is substantial, and migrating a codebase of that size isn’t something you do on a whim. But after spending time building a few smaller applications in Svelte, I reached the point where I simply preferred working with it.

It started with a personal project to manage my novels, followed by a work-related application for remotely managing Linux devices over SSH. Both were written in Svelte, and each one reinforced the feeling that the framework just gets out of your way and lets you build.

I’ll freely admit there was a healthy amount of vibe coding involved in all of this. Claude did a lot of the heavy lifting, and I was pleasantly surprised by how well it handled Svelte. The only real hurdle was making sure it understood I was targeting Svelte 5. Once I’d educated it to stick to the new rune-based syntax and stop mixing in legacy Svelte 4 patterns, things became remarkably smooth.

One discovery that really cemented my decision—and one I wish I’d found much earlier—was Svelte’s official AI Skills and MCP integration.

[https://svelte.dev/docs/ai/skills](https://svelte.dev/docs/ai/skills)

It’s a genuinely clever idea.

One of the frustrations with AI coding assistants is that they’re effectively frozen in time. Their built-in knowledge inevitably lags behind the latest framework releases, meaning you often spend time correcting outdated patterns or explaining new APIs.

The Skills and MCP approach changes that. Instead of relying solely on historical training data, Claude can consult current framework knowledge and best practices. It isn’t trapped in the past anymore; it can work with today’s version of Svelte rather than yesterday’s. That makes a noticeable difference when you’re working with a framework that’s evolving as quickly as Svelte.

On the frontend, I was already using Tailwind CSS alongside DaisyUI, and that combination has been fantastic. Between Svelte’s component model and DaisyUI’s polished components, the interface came together far quicker than I expected.

What impressed me most was responsive design. I never explicitly told Claude to optimise the UI for mobile devices, yet the layouts naturally adapted. Thanks to Tailwind’s responsive utilities and DaisyUI’s sensible defaults, the application looked good across different screen sizes almost by accident.

The end result is a stack I’m genuinely enjoying working with:

- **Python** (FastCGI backend)
- **PostgreSQL**
- **Svelte 5**
- **Tailwind CSS**
- **DaisyUI**

It’s fast, clean, easy to reason about, and—perhaps most importantly—it’s fun to build with.

I don’t think I’ll be looking back.
