---
pubDatetime: 2021-08-11T15:06:17Z
title: "Linux OCR"
tags:
  - "Linux"
description: "I needed to pull a lot of text from some images, and that called for OCR - Optical Character Recognition. It looks like the goto package for this is tesser"
---
I needed to pull a lot of text from some images, and that called for OCR - Optical Character Recognition.

It looks like the goto package for this is tesseract and gimageReader for GTK.

Installing things seemed straight forward, but then starting gimageReader I got some issues that seemed to be about some missing packages. I should read stuff as it happens more...

```
$ sudo pacman -S gimagereader-gtk
...
(12/13) installing tesseract                         [###########################] 100%
You must install one of tesseract-data-* packages or whole tesseract-data group
Optional dependencies for tesseract
```

Looking in the package manager I find what I need:

```
$ sudo pacman -S tesseract-data-eng
```

Now when I start gimageReader it complains about spellcheck languages. Read the docs and it's quick fix:

```
$ sudo pacman -S hunspell-en_gb
```

Now I have a fully functioning OCR program.
