---
pubDatetime: 2025-07-10T16:01:51+00:00
title: "Am I a Vibe Coder?"
tags:
  - "Web"
  - "Ai"
  - "Artificial Intelligence"
  - "Chatgpt"
  - "Claude"
  - "Javascript"
  - "Python"
  - "Technology"
heroImage: "/blog-media/2025/06/vscodium_logo.png"
description: "Over the past few months, I’ve transitioned from mostly infrastructure work to building a major web application for my employer. The idea originated from our CEO and was backed by my manager. I developed a proof of concept that got them genuinely excited, and they asked me to take it further—turn it into a full…"
---
Over the past few months, I’ve transitioned from mostly infrastructure work to building a major web application for my employer. The idea originated from our CEO and was backed by my manager. I developed a proof of concept that got them genuinely excited, and they asked me to take it further—turn it into a full production system we could present to customers.

At first, I was using [Claude](https://claude.ai) in the browser to help generate and refactor bits of code, learning and iterating along the way. Eventually, I moved to the [Claude API](https://www.anthropic.com/api), integrated it into my workflow using [Cline](https://cline.bot) with [VSCodium](https://vscodium.com). This meant I no longer had to copy-paste between tools—Claude could now operate directly within my codebase.

I should point out—I don’t consider myself a developer. I’ve done dev work before and understand the basics, but I’ve mostly built infrastructure systems for developers to use. So I decided to apply some of that QA thinking to my own workflow. I added [Trunk](https://trunk.io) to lint code and flag poor practices, especially around security. Then I spun up a local [SonarQube](https://www.sonarsource.com/products/sonarqube/) container and ran the generated code through it.

SonarQube immediately started surfacing issues. So I began crafting rules in Cline to pre-emptively address those. Sure enough, Cline started producing code that passed my QA checks without needing as many fixes. That felt like progress.

I also revisited my approach to unit testing. I had been aiming for code coverage, but between Claude and Cline, I ended up shifting to a more behavioural approach—writing tests to validate how the app should behave, not just whether functions were hit.

Documentation came next. I used [Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) to generate a clean structure, and then had Claude/Cline generate documentation alongside the code. It turned out to be more valuable than expected—Cline could refer back to the documentation when writing new parts of the app.

Then I discovered [Redocly](https://redocly.com), which automatically built out a fully documented API from my openapi.json. It didn’t just generate static docs—it gave me an interactive interface to test API endpoints, see required parameters, and understand expected responses. Genuinely brilliant.

If I’m honest, I’m a lazy coder—I usually know what I want to build, and can follow what Claude is doing enough to catch when it goes off-track. But the end result? A surprisingly robust system, using tools and frameworks I barely knew before—like Celery and Flower for distributed task queues. I’m still not entirely sure how they work under the hood, but they work.

Security was a major concern. I built access control lists to manage data visibility and used JWTs for authentication. I gave Claude strict security requirements, and it produced a standards-compliant auth system that I’ve tested against known patterns. It holds up.

So, while I may still be more of a “vibe” coder than a real developer, I’ve shipped something I’m genuinely proud of.
