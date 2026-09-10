---
pubDatetime: 2026-09-05T13:41:03+00:00
title: "Blume"
tags:
  - "Books"
  - "Ai"
  - "Artificial Intelligence"
heroImage: "/blog-media/2026/09/blume.png"
description: "When MkDocs 2.0 Broke Material, I Took the Opportunity to Try Blume I've been using MkDocs with the Material theme for the documentation for my Novel Codex project for quite a while. It has been a good combination: Markdown files, a simple configuration file, a decent-looking documentation site, and very little to think about. Then…"
---
# When MkDocs 2.0 Broke Material, I Took the Opportunity to Try Blume

I’ve been using MkDocs with the Material theme for the documentation for my Novel Codex project for quite a while. It has been a good combination: Markdown files, a simple configuration file, a decent-looking documentation site, and very little to think about.

Then MkDocs 2.0 happened.

And suddenly “leave it alone because it works” was no longer quite such an attractive long-term strategy.

## The problem with MkDocs 2.0

MkDocs 2.0 is a significant change rather than a routine version upgrade. More importantly for me, the version of Material for MkDocs I’ve been using isn’t compatible with it.

That leaves an awkward choice.

I could pin MkDocs to the 1.x series and continue using Material. That’s probably the least disruptive option in the short term, but it means deliberately staying on an old generation of the underlying platform.

I could move towards Zensical, which is the obvious option if you want to stay close to the Material/MkDocs ecosystem.

Or I could take a step back and ask a more basic question:

**If I’m going to have to change the documentation platform anyway, why not look at alternatives?**

That’s what led me to [Blume](https://useblume.dev).

## What I was actually starting with

The Novel Codex documentation isn’t particularly complicated.

The source is essentially a directory tree of Markdown files:

    docs/
    ├── index.md
    ├── architecture/
    ├── deployment/
    ├── development/
    ├── getting-started/
    └── user-guide/

There are around a few dozen pages covering things such as the architecture, deployment, development setup, user guide and getting started documentation.

The Markdown is deliberately straightforward. There are some frontmatter fields, Mermaid diagrams, tables, code blocks, admonitions and a few other conveniences, but there isn’t a huge amount of Material-specific wizardry embedded in the documentation.

My `mkdocs.yml`, on the other hand, had accumulated the usual configuration:

- Material’s navigation features
- search
- `awesome-pages`
- Git revision dates
- PyMdown extensions
- Mermaid support
- tabs
- admonitions
- code highlighting
- theme configuration

Nothing outrageous, but enough that a migration initially looked like it might involve translating a fair amount of configuration.

## Looking at Blume

Blume immediately caught my attention because it takes a rather different approach.

It’s built around modern web tooling rather than being another MkDocs theme. It uses Astro and Vite, supports Markdown and MDX, and provides things I’d otherwise expect to have to assemble from a collection of plugins.

More importantly, the basic model is refreshingly simple:

**Put your documentation in a directory structure and let the tool turn it into a documentation site.**

That sounded very much like what I was already doing.

It also has some particularly interesting features for documentation that will increasingly be consumed by AI coding tools, including Markdown representations of pages and tooling intended to make documentation accessible to AI systems.

I wasn’t looking for an “AI documentation system”, but it seemed like a sensible direction rather than an irrelevant gimmick.

## So I tried it

At this point I expected there to be some work involved.

There wasn’t.

I installed Blume, initialised a new project, and copied my existing documentation structure into it.

Then I built the site.

It worked.

The existing directory structure was understood, the Markdown rendered, the navigation appeared, and the search worked as expected.

That was the point where I stopped thinking of Blume as an interesting alternative and started thinking of it as a potential replacement.

## There were a couple of gotchas

It wasn’t completely zero-effort.

The first was the page title.

My existing Markdown pages looked like this:

``` markdown
# User Guide Overview

This guide covers the main features and workflows of Novel Codex.
```

Blume uses the page title from frontmatter to generate the H1, so leaving the Markdown H1 in place resulted in:

``` html
<h1>User Guide Overview</h1>
<h1 id="user-guide-overview">User Guide Overview</h1>
```

The solution was simple: move the title into the frontmatter and remove the Markdown H1.

The second change was admonition syntax.

MkDocs/PyMdown uses:

``` markdown
!!! note

    Something worth noting.
```

Blume uses the `:::` syntax instead.

So there was a small mechanical conversion required there.

Fortunately, Blume actually ships skills that explain these transformations to AI coding assistants. That made the changes particularly painless: the migration instructions could be given to the coding agent, and it knew what needed changing.

And that was pretty much it.

## What I didn’t have to do

This was probably the most surprising part.

I didn’t have to rewrite the documentation.

I didn’t have to redesign the directory structure.

I didn’t have to manually recreate the navigation.

I didn’t have to replace every page with some new component format.

I didn’t have to spend hours translating a huge configuration file.

The valuable part of my documentation — the Markdown itself — remained largely unchanged.

The migration was mostly a change to the machinery that turns those Markdown files into a website.

## Why not just move to Zensical?

That’s a perfectly reasonable question.

Zensical is arguably the more conservative choice. It comes from the same ecosystem as Material and is specifically intended to provide a modern successor to the MkDocs/Material approach.

If your existing documentation is heavily invested in Material-specific features and plugins, that’s probably a compelling option.

But Novel Codex wasn’t in that position.

Once I realised that my documentation was mostly just Markdown, the argument for preserving the old ecosystem became much weaker.

If I’m going to change the documentation engine anyway, I might as well look at what the alternatives offer.

## The result

The resulting Blume site looks good, the navigation works, search works as expected, and the existing documentation is still recognisably the same documentation.

The configuration is also considerably smaller.

That isn’t necessarily a scientific measure of anything — configuration size isn’t inherently bad — but I do like the idea that the structure of my documentation is primarily expressed by the structure of the files rather than by a separate pile of configuration.

And if I eventually need more control, Blume is built on Astro, so there is an escape hatch rather than a completely proprietary rendering system.

## Would I recommend Blume?

That’s a much harder question.

I’ve only just migrated one relatively small documentation site. I haven’t spent months maintaining a large Blume installation or pushed it through every obscure edge case that a mature documentation project can accumulate.

So I’m not going to claim that Blume is universally better than MkDocs Material, or that everyone should immediately migrate.

But I can say something more useful:

**For a new project, or for an existing Markdown-based project that is already being forced to change, Blume is absolutely worth evaluating.**

That was the key point for me.

If MkDocs 2.0 hadn’t forced the issue, I probably wouldn’t have gone looking.

But once the existing Material/MkDocs combination had an architectural dead end, there was no particular reason to assume that the correct answer was simply “find the nearest replacement”.

Sometimes a forced migration is an opportunity to ask whether you were using the right tool in the first place.

In my case, Blume turned out to be a surprisingly good fit.

And the migration took considerably less time than I expected.
