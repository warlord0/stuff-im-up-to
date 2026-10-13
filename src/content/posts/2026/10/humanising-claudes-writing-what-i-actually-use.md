---
pubDatetime: 2026-10-13T12:00:00Z
title: "Humanising Claude's Writing: What I Actually Use"
tags:
  - "ai"
  - "claude"
  - "writing"
description: "A copy-and-paste 'humanise this text' prompt went past me, and I compared it with the voice-hygiene rules my Claude Code writing skill already has. The skill checks sentence shapes, not just banned words. Here is what it does, what it gets wrong on a technical post, and what I'd steal from the prompt."
heroImage: "/blog-media/2026/10/claude-header.webp"
heroThumb: "/blog-media/2026/10/claude-thumb.webp"
---

I came across a prompt that promises to stop text sounding like AI. It tells the model to follow Wikipedia's Manual of Style and lists what to avoid: promotional tone, peacock terms such as "showcases" and "vibrant", vague claims like "experts say", flattering adjectives, weasel wording and repetitive sentence structure. It ends with "keep every fact exactly the same".

I asked Claude how well it would work before running it on anything. The answer was "moderately", and the reasons were more interesting than the verdict. They also sent me looking at what I already use, which turned out to be better.

## What the Prompt Gets Right

It lists concrete things to cut, and models follow concrete lists. Telling one to keep the facts and add nothing guards against the usual failure of a rewrite, which is invented detail. Asking for varied sentence length goes after the strongest tell there is: a run of sentences that are all the same length and all equally polished.

## Where It Falls Short

A list of banned words gets worked around. The model swaps "vibrant" for the next-nearest word and the pattern survives. Word choice is also the easy part. The tells that mark text as machine-written are mostly shapes: "not just X, but Y", lists of three, a tidy closing sentence that sums up the paragraph, an "additionally" at the front of every other sentence. The prompt mentions rhythm and nothing else structural.

Two of its instructions also pull against each other. "Avoid vague claims unless you can name who said it" can't be done without breaking "keep every fact", because the model can't name a source it doesn't have. The only way out is to delete the claim, and the prompt doesn't say whether that's allowed. And "neutral, like an encyclopedia" doesn't sit comfortably next to "the way a person would say it out loud". You can end up with stiff, even prose that still reads as machine-written.

## What I Use Instead

I have a Claude Code skill for drafting chapters of fiction. It has a section called voice hygiene, written after a recurring problem: phrases that read fine alone became a house style once they appeared in dozens of chapters, because each chapter was written without any view of how often the last twenty had used the same construction.

It works at three levels.

**Phrases.** A short list of specific offenders. The worst, historically, is "the particular [noun] of a [description]", as in "the particular stillness of a man who...". Others are "found himself" followed by a verb, "some part of him", "on the theory that" and "had nothing to do with". Each has a reason and a suggested alternative. Mostly the fix is to drop the filler word or make the sentence about what someone does.

**Structure.** The part I find most useful, because no word list catches it:

- Sentence-length variance. A paragraph where most sentences are 25 words or more, built from chained clauses, reads as managed rather than lived-in, whatever the vocabulary.
- Trailing interpretive tags: showing something and then explaining what it meant. The advice is to cut the explanation and trust the image.
- Rule-of-three constructions: fine occasionally, a tell if every beat is built that way.
- Sentence-opener repetition. Three or more consecutive sentences starting with the same word reads as mechanical.

**Tooling.** A small Python script, `prose_check.py`, runs the mechanical checks: the phrase list, the frequency of "the way" constructions, repeated openers inside a paragraph and across nearby ones, and a word count against a target range. It exits non-zero on a hard failure. The check I'd lift for any prose is the opener one. It splits a paragraph into sentences, takes the first word of each, and fails when three in a row match:

```python
def sentences(paragraph):
    flat = paragraph.replace("\n", " ")
    return [s for s in re.split(r"(?<=[.!?])\s+", flat) if s.strip()]

def opener(sentence):
    words = sentence.strip().split()
    return words[0].strip("\"“”'‘’") if words else ""

def check_within_paragraph_repetition(text):
    for p in paragraphs(text):
        starts = [opener(s) for s in sentences(p)]
        run = 1
        for i in range(1, len(starts)):
            same = starts[i] and starts[i].lower() == starts[i - 1].lower()
            run = run + 1 if same and starts[i].lower() not in STOPWORDS else 1
            if run >= 3:
                print(f"FAIL  3+ consecutive sentences opening with {starts[i]!r}")
```

This is trimmed from the real one, which collects its results into a list instead of printing them. It is crude. "The", "a" and "it" are excluded because they open too many sentences to mean anything, and it only looks at one paragraph at a time. A softer check warns when two paragraphs within two of each other start with the same word.

A second script, `ngram_scan.py`, looks across a whole folder of chapters for three-to-six-word sequences that turn up in many different chapters, which is what separates a real tic from a phrase reused heavily in one scene.

The skill is also clear about what this isn't. It says to treat it as a quality issue and not as a way of beating AI detectors, because those tools score how predictable the text is against a reference model, and changing sentence shape doesn't necessarily move that. I think that's the right framing.

## Running It on a Technical Post

The skill is built for fiction, so I tried the script on my last post, the Harmony replacement write-up, to see what happened.

It reported failures, and most were false alarms:

- The word count came out at 4,349 against a default ceiling of 3,500, a range chosen for chapters.
- It read markdown bullets as consecutive sentences starting with "-" and flagged them, and it flagged code lines beginning `def`.
- It found two real hits: "I'd rather" appears twice in the post, once while introducing the dead ends and once before an admission. The skill flags the phrase because it tends to become the default way of stating a preference, and the script was right to catch it.

So the tool is useful on prose and noisy on a technical post. The fix for the noise is to strip code blocks and lists before checking, which I haven't done. I have also not measured whether any of this makes text read as more human to anyone but me. The judgement is mine, formed by reading the output.

## What I'd Take From the Prompt

Two things. Its list of peacock terms and weasel wording covers non-fiction problems my fiction skill has no reason to mention: "showcases", "boasts", "many believe". And the instruction to keep every fact is worth stealing for any rewrite, with one change: say what to do with a claim you can't support. My version would say to delete it and list what was removed at the end, so I can check nothing real went with it.

If you want to try the prompt yourself, give it a before-and-after example first, since a model copies an example far more closely than a rule. A sample of your own writing helps more than anything else for voice. The structural tells above need to go in too, because the model can't fix what it hasn't been told to look for.
