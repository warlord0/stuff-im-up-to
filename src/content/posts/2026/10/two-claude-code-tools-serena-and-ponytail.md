---
pubDatetime: 2026-10-03T09:00:00Z
title: "Two Claude Code Tools Worth Keeping: Serena and Ponytail"
tags:
  - "ai"
  - "claude"
  - "claude-code"
  - "mcp"
heroImage: "/blog-media/2026/10/claude-header.webp"
heroThumb: "/blog-media/2026/10/claude-thumb.webp"
description: "Most of my days now are spent reviewing code an AI wrote rather than writing it. Two tools have changed how I do that: Serena, which navigates code by symbol rather than by file, and Ponytail, which pushes toward the smallest correct change. I audited whether each one earned its place, and what I found."
---

Most of my days now look the same. I write very little code myself. Instead I'm reviewing what Claude Code has written, checking it against my standards, my linting and my security rules, and deciding whether it should exist at all. Over the last few months I've added two tools to that workflow, and I wanted to know whether they were actually earning their place or just adding noise.

The first is [Serena](https://github.com/oraios/serena), a code toolkit exposed over MCP. The second is Ponytail, a Claude Code plugin with a ruleset that pushes toward the least code that solves the problem. They do different jobs, and they turn out to complement each other well.

## What Serena Changes

Without Serena, Claude Code finds things the way most of us do: it searches with grep, then reads whole files to understand what it found. That works, but it's expensive in context, and grep can't tell the difference between a function, a variable and a comment that happens to contain the same word.

Serena works at the level of symbols. It can find a symbol's definition, list everything that references it, rename it across the codebase, replace a symbol's body, and delete a symbol after checking nothing still uses it. The tool names give the flavour: `find_symbol`, `find_referencing_symbols`, `replace_symbol_body`, `rename_symbol` and `safe_delete_symbol`.

The benefit is that Claude asks precise questions and gets precise answers, instead of reading a 900-line file to find one function.

## What Ponytail Changes

Ponytail is the opposite kind of tool. It doesn't help Claude find code; it pushes Claude to write less of it. Its ruleset works down a ladder before writing anything: does this need to exist at all, is there already a helper in this codebase, does the standard library cover it, does a native platform feature cover it, does an installed dependency cover it, and only then write the minimum code that works.

It runs in modes. `lite` is a light touch, `full` enforces the ladder, and `ultra` goes further. It also has a `/ponytail-audit` command that scans a whole repository and produces a ranked list of what to delete, simplify or replace, without changing anything.

## The Audit

I ran a single audit session over a repository of roughly 61,000 lines to see whether both tools were doing what they claimed. The results were more useful than I expected, though I want to be clear about what they are and aren't. This was one session, judged from the transcript and the resulting commits, not a controlled benchmark.

**Serena** was used in roughly 227 calls, against 9 full-file `Read` calls. That's the change I cared about most: the model was reading far less of each file and asking for exactly what it needed. `safe_delete_symbol` also checked references before every deletion during the audit, which is the behaviour I want from a deletion.

Its weak spot was underuse. When I looked at the transcript, reference checks were still going to grep out of habit, even where a symbol-level lookup would have been more reliable. That's an instruction problem rather than a tool problem, and I fixed it in the project's `CLAUDE.md`, which I'll come back to.

**Ponytail** did what it was meant to. It made real cuts, fixed dependency and manifest problems, consolidated a search API that had grown several near-duplicate paths, and tidied the documentation. The part I valued most was judgement about what to keep. It didn't just delete things for the sake of it. Where code looked redundant but was doing a job, it left it alone.

The fixed cost of Serena is that its tool definitions load into every session. That's small next to the cost of a single avoided full-file read on a repository that size. I don't have a number to put on that trade-off yet. A proper A/B test on a reference-heavy task would give one, and I'd like to run it.

## Making the Tools Work Together

The `CLAUDE.md` rules did most of the heavy lifting, and they live in two places. Repo-specific rules sit in the project's own `CLAUDE.md`, while behaviour I want everywhere sits in my global `~/.claude/CLAUDE.md`.

The repo-specific rules for the novel-writing project cover tool use and deletion. Here are the relevant rules, trimmed from the full file:

```markdown
## Verification
- Before deleting anything, confirm it is unused with
  find_referencing_symbols. For anything used from .svelte files, also
  confirm with svelte-check and a production build.

## Tool use
- Check whether a code symbol is used with Serena's
  find_referencing_symbols, not grep. Use grep only for non-code text
  (docs, config, paths).
- Make file edits with Edit or Serena's editing tools. sed -i is
  acceptable for bulk mechanical replacements across many files; show
  git diff --stat afterwards.
```

Grep is still the right tool for non-code text like docs, config and paths. The `sed -i` allowance is deliberate: for bulk mechanical renames, it's faster and easier to review than a long run of symbol edits, provided the diff stat is shown afterwards.

The global file handles the other problem, which is how I want Claude to push back. Ponytail answers "should this exist?" and Serena makes checking cheap, but neither asks whether the approach is right in the first place.

This section predates both tools. I wrote it because I noticed Claude was too keen to satisfy whatever I'd just asked for, and I wanted it to push back where it genuinely mattered without nagging about everything else. The global file starts with an `@RTK.md` import, then this section:

```markdown
## How to work with me
- Before implementing, flag if my request conflicts with best practice,
  introduces security/reliability risk, or if a materially simpler or
  more robust approach exists. Explain the trade-off briefly.
- Only push back on things that matter: correctness, security,
  maintainability, performance at realistic scale. Don't relitigate
  style or minor preferences.
- If I've stated a reason for an approach, respect it unless the reason
  is factually wrong.
- Once I've heard the objection and confirmed, implement as asked
  without further argument.
- If you're uncertain whether something is a problem, say so rather
  than presenting it as fact.
```

The last two bullets do most of the work. Once I've heard an objection and confirmed the choice, Claude stops arguing and builds it. And if Claude isn't sure something is a problem, it has to say so rather than dress a guess up as fact.

## Where Ponytail Gets In the Way

Ponytail's always-on mode injects its ruleset into every turn. For most feature work that's a good bias towards minimalism. For infrastructure code, though, defensive handling and explicit error paths are often the whole point, and a minimalism rule can work against you there.

My current setup is `/ponytail lite` as the everyday default, switching to full mode when I want it actively policing a piece of work, and running `/ponytail-audit` every few months or after a large feature lands. If day-to-day code is already tight, turning it off between audits loses little.

## Checking It Still Works

The useful test is to repeat the transcript analysis on the next substantial session. If Serena's share of symbol lookups has gone up and grep's share has gone down, the setup is doing what I intended. If it hasn't, the problem is in the instructions, not the tools.

Neither tool replaces judgement. They make the judgement cheaper to act on, and make it harder for the AI to quietly build something I didn't ask for.
