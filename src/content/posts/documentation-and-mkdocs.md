---
pubDatetime: 2025-04-30T12:44:49Z
modDatetime: 2025-05-02T15:18:16Z
title: "Documentation and MkDocs"
tags:
  - "material"
  - "mkdocs"
  - "Web"
description: "Anything I do gets documentation, for no other reason that if I ever return to it later, I'll understand what I did. You can be sure that I will have forgo"
---
Anything I do gets documentation, for no other reason that if I ever return to it later, I'll understand what I did. You can be sure that I will have forgotten how or why I did something, so I religiously document stuff, like this site for example.

For work projects we use Confluence, and a development project I have uses [docusaurus](https://docusaurus.io) - mainly because I have Claude AI writing the documentation, and It manages quite well with markdown and docusaurus.

But for a personal project, I found docusaurus a bit overwhelming. I'd already got a bunch of markdown files in a folder structure ready to go. What I wanted was to not molest the files at all and just have something present them logically straight from the markdown. This is where I discovered [MkDocs](https://www.mkdocs.org).

I followed the simple install process `pip install mkdocs`, and made a simple change to the `mkdocs.yml` file. My documents are in a subfolder called `notes`. The change was simple enough:

```
site_name: Black Eyes and Broken Souls
docs_dir: notes
```

Then I started up the MkDocs server:

```
mkdocs serve
```

It was all I needed to do to get a web service publishing my markdown to a web page!

The initial theme is a bit meh!, but it works straight out of the box. No editing sidebar and config files, it just works. What I also like is that it adds a search feature too. The search is also local, so it doesn't rely on an external service indexing your data. Which is important to me and not everything I've written should end up harvested by AI, or be publically accessible.

Now I thought what can I do to make it prettier. It doesn't have to be world ready, I'm probably the only one who will ever use it, but it should at least have a dark mode theme. I found you could switch the theme in the YAML file using:

```
site_name: Black Eyes and Broken Souls
docs_dir: notes
theme:
  name: readthedocs
```

Much, much better. But still no dark mode. I then found this: [https://github.com/squidfunk/mkdocs-material](https://github.com/squidfunk/mkdocs-material)

```
pip install mkdocs-material
```

Have to say, WOW! There's so many options and features. I struggled to find dark mode, though. But it's not obvious in the documentation, which I though ironic. I found I could learn more from the sample [`mkdocs.yml`](https://github.com/squidfunk/mkdocs-material/blob/4c0004e16b1d51511fbd3c8537394069f004ecfe/mkdocs.yml) config though:

```
  palette:
    - media: "(prefers-color-scheme)"
      toggle:
        icon: material/link
        name: Switch to light mode
    - media: "(prefers-color-scheme: light)"
      scheme: default
      primary: indigo
      accent: indigo
      toggle:
        icon: material/toggle-switch
        name: Switch to dark mode
    - media: "(prefers-color-scheme: dark)"
      scheme: slate
      primary: black
      accent: indigo
      toggle:
        icon: material/toggle-switch-off
        name: Switch to system preference
```

This adds a toggle at the top of the page so you can switch between system, dark and light modes.

The more I dig, the more I find. There are all kinds of options to modify how to handle navigation and searching and markdown. I ended up with a full config that looks like this (so far):

```
site_name: Black Eyes and Broken Souls
docs_dir: notes
theme:
  name: material
  features:
    - search.suggest
    - navigation.footer
    - navigation.tabs
    - navigation.tabs.sticky
    - navigation.indexes
    - navigation.path
    - navigation.top
    - toc.follow
  palette:
    - media: (prefers-color-scheme)
      toggle:
        icon: material/lightbulb-variant
        name: Switch to light mode
    - media: "(prefers-color-scheme: light)"
      scheme: default
      primary: red
      accent: red
      toggle:
        icon: material/lightbulb-outline
        name: Switch to dark mode
    - media: "(prefers-color-scheme: dark)"
      scheme: slate
      primary: red
      accent: red
      toggle:
        icon: material/lightbulb-multiple-outline
        name: Switch to system preference
plugins:
  - search
  - meta
  - offline
  - tags
  - minify:
      minify_html: true
copyright: Copyright &copy; 2025, Paul Green
extra:
  generator: false
markdown_extensions:
  - admonition
  - pymdownx.details
```

## Hosting on Cloudflare Pages

Because MkDocs builds static site content using:

```
mkdocs build
```

You end up with a `site` folder in your build. This can be hosted on Cloudflare pages by granting Cloudflare access to your GitHub repository, choose the template for MkDocs, and it already knows the `site` folder should be where it finds the documentation you want to host.

Now anytime you push new changes to the `site` folder your web pages on Cloudflare will automatically get updated.

### UV

I switched to using the [uv](https://docs.astral.sh/uv/) package manager for Python (and you should too), and this caused an issue with Cloudflares deployment. Once I edited my `pyproject.toml` file to add the `[build-system]` and `[tool.setuptools]` sections, Cloudflare was able to deploy successfully.

```
[project]
name = "Black Eyes and Broken Souls"
version = "0.1.0"
description = "A Mick Hargraves Series"
readme = "README.md"
requires-python = ">=3.13"
dependencies = [
    "mkdocs>=1.6.1",
    "mkdocs-material>=9.6.12",
    "mkdocs-minify-plugin>=0.8.0",
]

[build-system]
requires = ["setuptools>=61.0"]
build-backend = "setuptools.build_meta"

[tool.setuptools]
packages = []
```

## Additional Plugins

Awesome Nav for MkDocs - [https://lukasgeiter.github.io/mkdocs-awesome-nav/](https://lukasgeiter.github.io/mkdocs-awesome-nav/)

## Refrences

[https://www.mkdocs.org](https://www.mkdocs.org)

[https://squidfunk.github.io/mkdocs-material/](https://squidfunk.github.io/mkdocs-material/)

[https://squidfunk.github.io/mkdocs-material/setup/extensions/python-markdown](https://squidfunk.github.io/mkdocs-material/setup/extensions/python-markdown/#admonition)

[https://squidfunk.github.io/mkdocs-material/setup/extensions/python-markdown-extensions/](https://squidfunk.github.io/mkdocs-material/setup/extensions/python-markdown-extensions/)
