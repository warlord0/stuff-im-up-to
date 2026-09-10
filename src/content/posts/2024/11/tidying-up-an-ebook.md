---
pubDatetime: 2024-11-20T21:13:54Z
modDatetime: 2024-11-30T12:38:56Z
title: "Tidying up an eBook"
tags:
  - "books"
  - "Docker"
  - "ebook"
  - "ebooks"
  - "kindle"
  - "Linux"
  - "reading"
  - "writing"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "I use LibreWriter to write eBooks with, then save them as .epub."
---
## Using LibreOffice and Sigil

I use LibreWriter to write eBooks with, then save them as `.epub`.

### LanguageTool Server

Why use LibreWriter? I've set up a docker container running LanguageTool and use this as an external spelling and grammar checker.

```
---
services:
  languagetool:
    image: meyay/languagetool:latest
    container_name: languagetool
    restart: unless-stopped
    user: "783:783"
    read_only: true
    tmpfs:
      - /tmp
    cap_drop:
      - ALL
    security_opt:
      - no-new-privileges
    ports:
      - 127.0.0.1:8010:8010
    environment:
      download_ngrams_for_langs: en
      langtool_disabledRuleIds: OXFORD_SPELLING_Z_NOT_S
    volumes:
      - /opt/ngrams:/ngrams
      - /opt/fasttext:/fasttext
```

This Docker image also downloads the [ngrams](https://dev.languagetool.org/finding-errors-using-n-gram-data.html) data and extracts it to `/ngrams` - It's a pretty large file (8GB zipped).

The `disabledRuleIDs` turns off the annoying `ise` to `ize` warnings.

### TagMechanic

Saving as `.epub`, what I found was the formatting of the HTML within the `.epub` had some quirks. I'd often find a `<span class="span3">` and what would make it worse would be there may be another nested within the same tag.

Install the Sigil plugin [TagMechanic](https://www.mobileread.com/forums/showthread.php?t=270639)

Use `Plugins` \> `Edit` \> `TagMechanic`

Select all the `.xhtml` files within the `.epub`

Set the dialog to `Delete`, `span`, having `class`, value of `span\d+`, tick `Regex`

Click `Process`

#### Other Rules

Set the dialog to `Change`, `p`, having `class`, value of `para\d+`, tick `Regex`

## PuctuationSmarten

This Sigil plugin sorts out the mess that LibreWriter seems to make of quotation marks, single or double. It doesn't seem consistent in what it uses, this causes the spellchecker to have issues with words containing apostrophes, and where you may have used single quotation marks.

### Meta Data

Use the meta-data editor to add in

Title

Belongs to a Collection

- Collection is a Series
- Position in Group
- Id Attribute

dc:identifier: urn:AMAZON:`[ASIN]`

Description

Creator

Language: English - Great Britain
