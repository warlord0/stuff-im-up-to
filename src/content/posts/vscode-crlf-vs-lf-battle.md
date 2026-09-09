---
pubDatetime: 2019-09-04T19:55:37Z
modDatetime: 2019-09-04T20:00:09Z
title: "VSCode CRLF vs LF Battle"
tags:
  - "Linux"
  - "Windows"
description: "I'm a Linux guy. I like my line feeds a simple LF. but when developing cross platform and you hit Windows and face CRLF. It can be a real linting challenge"
---
I'm a Linux guy. I like my line feeds a simple LF. but when developing cross platform and you hit Windows and face CRLF. It can be a real linting challenge.

Git tries to be helpful in that it translates LF to CRLF when you pull onto a windows platform. But that doesn't help at all when your projects `.eslintrc.js` is set for unix type line endings.

```
      "linebreak-style": [
        "error",
        "unix"
      ], 
```

Changing CRLF to LF in VSCode is easy enough, but having to do it on every file you open is madness.

My answer was to setup the projects `.gitattributes` file, change my `~/.gitconfig` on the Windows machine and set the `files.eol` in VSCodes `settings.json`.

#### .gitattributes

```
 text=lf
 *.css linguist-vendored eol=lf
 *.scss linguist-vendored eol=lf
 *.js linguist-vendored eol=lf
 *.php eol=lf
 CHANGELOG.md export-ignore 
```

#### ~/.gitconfig

```
[core]
         autocrlf = false
```

#### settings.json

```
     "files.eol": "\n", 
```

### Fixing the Already Converted CRLF's

To do this you need to clear and reset your git structure and you should see the files happily stay as LF.

Safest bet is to ensure you have saved, committed and pushed your changes before doing this.

```
git rm --cached -r .
git reset --hard
git pull --rebase
```
