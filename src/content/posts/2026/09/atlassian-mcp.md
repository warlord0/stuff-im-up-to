---
pubDatetime: 2026-09-14T20:01:47+00:00
title: "Atlassian MCP"
tags:
  - "Claude Code"
  - "MCP"
  - "Confluence"
heroImage: "/blog-media/2026/09/atlassian.webp"
heroThumb: "/blog-media/2026/09/atlassian-thumb.webp"
description: "The Atlassian MCP is a really useful addition to Claude Code, giving Claude direct access to Confluence and Jira. There is a downside though: the Confluence API can return a lot of information, so it's worth adding some rules to CLAUDE.md to keep token usage down…"
---

## Using the Atlassian MCP with Claude Code

The Atlassian MCP is a really useful addition to Claude Code, giving Claude direct access to Confluence and Jira.

## Adding the Atlassian MCP

From the terminal, add the Atlassian MCP as an HTTP server:

```bash
claude mcp add -t http atlassian https://mcp.atlassian.com/v1/mcp
```

Claude will then prompt you to authorise access to Atlassian.

### Authorisation

Authorise it in the same way as the other MCP integrations — follow the authentication flow presented by Claude and grant access to the required Atlassian account.

Once authorised, Claude can interact with your Jira and Confluence content directly.

---

## Reducing Token Usage

This can be **very** useful, but there is a downside: the Atlassian API can return a *lot* of information.

In one test, Claude used a considerable number of tokens just writing two files. Asking Claude how to reduce that led to a useful addition for `~/.claude/CLAUDE.md`.

Add the following:

```markdown
# Atlassian MCP (Confluence/Jira)

Default to the narrowest call that answers the question. Confluence's API is verbose by default — full metadata, `_links`, `_expandable` stubs, author profile objects on every item returned — so broad listing/search calls cost far more than the same information scoped tightly.

- Before searching broadly, ask for a page URL/ID or space key if the user might have it handy — skips the listing/search call entirely.

- Scope `searchConfluenceUsingCql` tightly (add `space = KEY` or a title filter) rather than a bare `text ~ "..."` across the whole site.

- Before updating an **existing** page, fetch it once with `contentFormat: "html"` (not `"markdown"`) if it might contain macros (TOC, diagrams, panels, app extensions like Mermaid). A plain-markdown `updateConfluencePage` on such a page gets rejected outright (422, "would cause data loss") after already round-tripping the full page, forcing a redo in HTML — pages you're creating fresh, or that you know are plain prose/tables, are fine to author in markdown directly.

- Call `getContentFormatGuide` once per session and reuse it for every subsequent HTML edit in that conversation rather than re-fetching it per page.

- When reconstructing a page's HTML to preserve an existing macro/extension, copy its `data-parameters` attribute verbatim from the fetched HTML rather than reconstructing it by hand — these payloads are opaque and easy to get subtly wrong.
```

## Why this helps

The important principle is:

> **Don't make Claude retrieve the entire Atlassian universe when it only needs one page.**

Confluence responses contain a lot of metadata that isn't necessarily useful for the task at hand. Narrowing searches and fetching only the content required can significantly reduce the amount of information Claude has to process — and therefore the number of tokens consumed.

The advice about **HTML vs Markdown is particularly important** when editing existing Confluence pages. Modern Confluence pages can contain macros, diagrams, panels and other extensions that aren't safely represented as plain Markdown.

If Claude fetches an existing page as Markdown and then attempts to write it back, Confluence may reject the update with a `422` error because doing so could result in data loss.

For existing pages that may contain these extensions:

1. Fetch the page as HTML.
2. Preserve the existing macro/extension markup.
3. Make the required changes.
4. Update the page using the HTML representation.

For newly created pages, or pages known to contain only straightforward prose and tables, Markdown is generally fine.

## The payoff

With the Atlassian MCP configured, Claude can effectively become another interface to your Jira and Confluence environment — searching documentation, reading existing pages, creating documentation and updating content without having to manually copy and paste information between systems.

It's a surprisingly powerful combination of **Claude Code + Jira + Confluence**.

And, yes, it does start to raise the slightly uncomfortable question:

> *If Claude is coding **and** documenting everything, what exactly do you need me for?* 😄
