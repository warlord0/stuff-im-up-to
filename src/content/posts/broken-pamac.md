---
pubDatetime: 2024-12-08T14:24:10Z
modDatetime: 2024-12-08T14:24:44Z
title: "Broken Pamac"
tags:
  - "Linux"
  - "manjaro"
  - "pamac"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "conflicting dependencies: - x!�9t and a ��Ch�f��Gz are in conflict"
---
I went to install a new program today and `pamac` decided it need a lot of updates. The problem was that the updates failed with a confusing error message that contained garbage characters.

```
conflicting dependencies: - x!�9t and a ��Ch�f��Gz are in conflict
```

I tried deleting the package cache, reinstalling pamac using pacman, and many other methods of package maintenance and nothing worked.

The only thing that worked was going in the GUI package manager and selectively installing packages, in batches of 10 to see if I could find the conflict. After getting down through many pages of updates, I was about to surrender, then I just went to do all the updates again - it worked! No more conflict. Not a clue about what the problems were, but it seemed to be resolved by selective installation from the GUI.
