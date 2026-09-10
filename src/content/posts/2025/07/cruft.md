---
pubDatetime: 2025-07-16T17:53:17+00:00
title: "Cruft"
tags:
  - "Git"
  - "Linux"
  - "Programming"
  - "Python"
  - "Web Development"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "“Cruft” is informal tech-slang for anything that’s left in a system but no longer serves a clear purpose—old code, redundant files, forgotten configuration settings, stale comments, or even obsolete hardware. Over time these remnants accumulate, making software (or an organization’s processes) harder to understand, maintain, or extend. In short, cruft is digital clutter or technical…"
---
> “Cruft” is informal tech-slang for anything that’s left in a system but no longer serves a clear purpose—old code, redundant files, forgotten configuration settings, stale comments, or even obsolete hardware. Over time these remnants accumulate, making software (or an organization’s processes) harder to understand, maintain, or extend. In short, cruft is digital clutter or technical debt.

I just burned an entire day on digital clutter.

Someone once slapped “enhanced\_” on a file and its functions, then left the obsolete version lying around. I kept editing the wrong one—wrote fresh tests, rewrote docs—only to discover the real, up-to-date file already held the changes I just duplicated.

Let my wasted hours be your shortcut. I’ve written a short checklist, so this can’t happen again; follow it, and you’ll never step in the same trap.

## No Cruft Code Policy

### Rules

#### no_cruft_code

- **description**: “Prevent creation of prefixed/suffixed files that leave legacy code behind”

&nbsp;

- **prohibited_actions**:
  - “Creating files with prefixes like ‘Enhanced’, ‘Improved’, ‘Fixed’, ‘New’, ‘Updated’, ‘Better'”
  - “Creating files with suffixes like ‘V2’, ‘V3’, ‘New’, ‘Updated’, ‘Fixed'”
  - “Keeping old files when creating replacements”
  - “Commenting out large blocks of code instead of removing them”

&nbsp;

- **required_actions**:
  - “ALWAYS replace existing files in-place when making improvements”
  - “ALWAYS remove old files when creating replacements”
  - “Use version control (git) for history, not file naming”
  - “If major refactoring is needed, create feature branch but still replace files”

&nbsp;

- **enforcement**:
  - “Before creating any new file, check if it’s replacing an existing one”
  - “If replacing functionality, DELETE the old file in the same commit”
  - “If uncertain about replacement, ASK before creating new files”
  - “Use descriptive commit messages to explain what was replaced”

&nbsp;

- **examples**:
  - **BAD**:
    - “TrackerFetcher.js” + “EnhancedTrackerFetcher.js” (both exist)
    - “UserService.js” + “UserServiceV2.js” (both exist)
    - “// OLD CODE – keeping for reference” (commented blocks)
  - **GOOD**:
    - Replace TrackerFetcher.js content directly
    - Use git history to see previous versions
    - Clean removals with clear commit messages

&nbsp;

- **exceptions**:
  - “Temporary files during development (must be cleaned up before PR)”
  - “A/B testing scenarios (with clear removal timeline)”
  - “Gradual migration with documented timeline and clean up plan”

## Remember

- “When modifying existing functionality, REPLACE files in-place rather than creating new ones”
- “If you’re about to create a file with Enhanced/Improved/Fixed/New prefix, STOP and ask if yourself should replace the existing file instead”
- “Remove old files if any are discovered during development”
