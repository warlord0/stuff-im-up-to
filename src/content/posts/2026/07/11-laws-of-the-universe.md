---
pubDatetime: 2026-07-21T11:38:13+00:00
title: "11 Laws of the Universe"
tags:
  - "Networking"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "These aren't scientific laws, but widely-used mental models and heuristics that help explain behaviour, decision-making, management and problem solving. 1. Parkinson's Law Definition \"Work expands to fill the time available for its completion.\" Coined by historian C. Northcote Parkinson in 1955. Meaning People naturally consume whatever time they are given. Give someone: 2 hours →…"
---
These aren’t scientific laws, but widely-used mental models and heuristics that help explain behaviour, decision-making, management and problem solving.

------------------------------------------------------------------------

# 1. Parkinson’s Law

**Definition**

> “Work expands to fill the time available for its completion.”

Coined by historian C. Northcote Parkinson in 1955.

## Meaning

People naturally consume whatever time they are given.

Give someone:

- 2 hours → it takes 2 hours.
- 2 weeks → it somehow takes 2 weeks.

The amount of work often remains similar.

## Example

If you give yourself all weekend to write a report, it will probably take all weekend.

If your boss needs it by 3 pm today, you’ll probably finish it by 3 pm.

## How to use it

- Set shorter deadlines.
- Break work into small timed tasks.
- Avoid perfectionism.

------------------------------------------------------------------------

# 2. Hofstadter’s Law

**Definition**

> “It always takes longer than you expect, even when you take into account Hofstadter’s Law.”

— Douglas Hofstadter (1979).

## Meaning

Humans are consistently optimistic about estimates.

Even when you know projects overrun, you’ll still underestimate the next one.

## Example

Software project estimate:

- Expected: 3 months
- Reality: 6 months

Everyone acts surprised.

------------------------------------------------------------------------

# 3. Hanlon’s Razor

**Definition**

> “Never attribute to malice that which is adequately explained by stupidity.”

## Meaning

Most mistakes come from:

- ignorance
- incompetence
- misunderstanding
- carelessness

—not evil intent.

## Example

Someone forgets to reply to your email.

Don’t assume they’re deliberately ignoring you.

They’re probably just busy.

## How to use it

Reduce unnecessary conflict by assuming simple explanations first.

------------------------------------------------------------------------

# 4. The Pareto Principle (80/20 Rule)

**Definition**

> Roughly **80% of results come from 20% of causes.**

## Examples

- 20% of customers produce 80% of revenue.
- 20% of bugs cause 80% of crashes.
- 20% of features get 80% of usage.

## How to use it

Find the critical few rather than optimising everything equally.

------------------------------------------------------------------------

# 5. The Peter Principle

**Definition**

> “People in a hierarchy tend to rise to their level of incompetence.”

Laurence J. Peter (1969).

## Meaning

People are promoted because they’re good at their current job—not because they’re suited to the next one.

Eventually they reach a role they’re no longer good at.

## Example

Excellent software engineer

↓

Engineering manager

↓

Poor people manager

------------------------------------------------------------------------

# 6. Hick’s Law

**Definition**

> The more choices available, the longer it takes to make a decision.

## Example

Choosing from:

- 3 restaurants → easy
- 300 restaurants → difficult

## Applications

- Website design
- User interfaces
- Menus
- Product catalogues

Keep choices manageable.

------------------------------------------------------------------------

# 7. Goodhart’s Law

**Definition**

> “When a measure becomes a target, it ceases to be a good measure.”

— Charles Goodhart.

## Meaning

People optimise the metric instead of the real objective.

## Examples

School:

- Measure: exam scores
- Result: teaching to the test

Business:

- Measure: calls answered
- Result: rushed customer service

Software:

- Measure: lines of code
- Result: bloated codebase

## Lesson

Metrics should guide decisions—not become the goal.

------------------------------------------------------------------------

# 8. The Dunning–Kruger Effect

**Definition**

> People with low ability tend to overestimate their competence, while highly skilled people often underestimate themselves.

## Why?

Beginners don’t yet know enough to recognise their own mistakes.

Experts know how much there is still to learn.

## Example

Beginner programmer:

> “Programming is easy.”

Experienced programmer:

> “This is more complicated than I thought.”

------------------------------------------------------------------------

# 9. Occam’s Razor

**Definition**

> When multiple explanations fit the facts, prefer the simplest one that adequately explains the evidence.

## Example

Your application suddenly starts returning HTTP 500 errors after a deployment.

Possible explanations:

- A configuration file contains an incorrect database connection string ✔
- The latest code introduced a null pointer exception ✔
- A kernel bug is corrupting memory ✖
- A sophisticated nation-state attacker has compromised your Kubernetes cluster ✖

Start by checking the deployment logs, recent code changes and configuration. In practice, most production issues are caused by recent, ordinary changes rather than extremely rare failures.

## Note

The simplest explanation is **not always** the correct one.

Occam’s Razor doesn’t say “the simplest answer is true”—it says **start with the explanation that makes the fewest assumptions**. Rule out the common causes before investigating the exotic ones.

------------------------------------------------------------------------

# 10. Chesterton’s Fence

**Definition**

> Never remove something until you understand why it was put there.

## Meaning

Existing systems often contain hidden knowledge.

Removing them without understanding can create bigger problems.

## Example

Developer:

> “This code looks pointless.”

Deletes it.

Production immediately breaks.

## Lesson

Understand before changing.

------------------------------------------------------------------------

# 11. Brooks’s Law

**Definition**

> “Adding manpower to a late software project makes it later.”

— Fred Brooks, *The Mythical Man-Month*.

## Why?

New people require:

- onboarding
- training
- communication
- coordination

Existing staff spend time teaching instead of delivering work.

The project slows down before it speeds up.

## Example

Project is already two months late.

Management hires six new developers.

Senior developers now spend all day answering questions.

Delivery slips even further.

------------------------------------------------------------------------

# Summary Table

| Law                   | Core Idea                                           |
|-----------------------|-----------------------------------------------------|
| Parkinson’s Law       | Work expands to fill available time.                |
| Hofstadter’s Law      | Everything takes longer than expected.              |
| Hanlon’s Razor        | Assume incompetence before malice.                  |
| Pareto Principle      | 80% of results come from 20% of causes.             |
| Peter Principle       | People are promoted to their level of incompetence. |
| Hick’s Law            | More choices mean slower decisions.                 |
| Goodhart’s Law        | Targets corrupt measurements.                       |
| Dunning–Kruger Effect | Incompetence breeds overconfidence.                 |
| Occam’s Razor         | Prefer the simplest adequate explanation.           |
| Chesterton’s Fence    | Understand before changing.                         |
| Brooks’s Law          | Adding people to a late project makes it later.     |

------------------------------------------------------------------------

# Final Thought

None of these “laws” is universally true. They are heuristics—useful rules of thumb rather than absolute rules. Their value comes from prompting better questions:

- Am I overcomplicating this? (Occam)
- Why does this process exist? (Chesterton)
- Am I measuring the right thing? (Goodhart)
- Have I allowed too much time? (Parkinson)
- Am I being unrealistically optimistic? (Hofstadter)

Together, they form a practical toolkit for thinking more clearly about work, management, engineering and everyday decisions.
