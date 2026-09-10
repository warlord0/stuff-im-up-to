---
pubDatetime: 2025-11-12T17:44:20+00:00
title: "Building My Own Novel-Writing Assistant"
tags:
  - "Javascript"
  - "Ai"
  - "Artificial Intelligence"
  - "Chatgpt"
  - "Llm"
  - "Mcp"
  - "Python"
  - "Technology"
heroImage: "/blog-media/2025/11/image.png"
description: "— and Teaching AI My Lore I’ve been developing an application to help with my novel writing. I wanted something that could track characters and chapters—not just where they appear, but also a full codex of style, tone, and continuity data across my story world. The Stack: Familiar Tools, Simple Foundations I built it using…"
---
## — and Teaching AI My Lore

------------------------------------------------------------------------

I’ve been developing an application to help with my novel writing. I wanted something that could track characters and chapters—not just where they appear, but also a full codex of style, tone, and continuity data across my story world.

![Novel Codex - Chapters](/blog-media/2025/11/image.png)

### The Stack: Familiar Tools, Simple Foundations

I built it using tools I’m comfortable with:

- **Python FastAPI** backend
- **Vanilla JavaScript** frontend
- **SQLite3** as the initial database (with planned migration to PostgreSQL)

I’ve found that when working with AI coding assistance, frontend frameworks often get in the way. Sticking with plain JavaScript made it much easier to reason about and debug the generated code.

SQLite3 has been perfectly adequate for prototyping. Even storing my chapter texts as `TEXT` columns works fine for now. The backend is structured so that I can migrate to PostgreSQL later without changing the application logic.

### Versioning and Recovery

To preserve older drafts, I implemented **database triggers** that automatically archive the previous version of a record whenever a chapter or character profile is updated. This creates a lightweight versioning system—simple but effective. Rolling back to an earlier version is as easy as restoring a row from a history table.

### Linking Characters to Chapters

Another useful feature is the **character finder**. It scans chapter text to detect when characters are mentioned, allowing me to create explicit links between characters and chapters. This gives me a clear view of where each character appears and how often they’re active in the story.

### Enter the MCP: Giving AI Access to the Codex

At some point, I realized I wasn’t just building a codex—I was building something AI could use to maintain story consistency. That led me to the **Model Context Protocol (MCP)**.

MCP is a way to expose structured tools and data to AI models like Claude. It allows the model to query my worldbuilding data directly—fetching characters, lore documents, chapters, or any other structured content it needs to reason about.

So, I asked Claude to help me write an MCP server that could talk to my Novel Codex API. The result was a surprisingly compact and clean piece of code—about 400 lines that define a small collection of **tools** representing endpoints like:

- `search_characters`
- `get_character_details`
- `list_chapters`
- `get_lore_tree`
- `search_lore_text`
- `find_characters_in_text`

Each tool maps neatly onto an API route, with schema definitions for the parameters and structured JSON responses.

Here’s a snippet from the server definition:

```
@app.list_tools()
async def list_tools() -> List[Tool]:
    return [
        Tool(
            name="search_characters",
            description="Search for characters in the codex...",
            inputSchema={
                "type": "object",
                "properties": {
                    "project_id": {"type": "integer"},
                    "skip": {"type": "integer", "default": 0},
                    "limit": {"type": "integer", "default": 50},
                },
                "required": ["project_id"],
            },
        ),
        ...
    ]
```

The server itself runs over **stdio**, which means Claude Code can talk to it directly via MCP—no extra networking setup required.

### Using AI to Enforce Continuity

Once the MCP service was running, I could connect it to Claude Code and issue prompts like:

> “Can you revise the grammar in this chapter to match my mature writing style, and ensure each character’s dialogue stays consistent with their profile?”

The model then queries my codex through the MCP, reviewing character data and prior appearances to maintain consistency while improving grammar and tone. Essentially, it becomes an **AI continuity editor** for my novel.

### Closing Thoughts

This whole experiment started as a writing aid, but it’s evolved into a hybrid of **worldbuilding database**, **AI-assisted editor**, and **authoring toolchain**.

The codebase isn’t huge, but it’s deeply personal—an intersection of engineering and storytelling that feels like a natural next step for creative software.
