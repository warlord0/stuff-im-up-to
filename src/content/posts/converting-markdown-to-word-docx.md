---
pubDatetime: 2023-08-24T09:22:01Z
modDatetime: 2023-08-24T09:23:21Z
title: "Converting Markdown to Word (.docx)"
tags:
  - "Linux"
description: "The easiest way to do this is using pandoc. But there is no need to install it, you can use it as a docker image. This does mean you need to have docker in"
---
The easiest way to do this is using pandoc. But there is no need to install it, you can use it as a docker image. This does mean you need to have docker installed, and configured, so you can run it.

## Converting a File

To convert a single file, ensure you are in the folder with the file you want to convert.

```
$ docker run --rm -v .:/data:rw --user $(id -u):$(id -g) pandoc/core -t docx MYFILE.md -o MYFILE.docx
```

\* Where MYFILE.md is the name of the file you want to convert, and MYFILE.docx is the output file.

## Converting All Files in the Current Folder

```
$ for f in *.md; do docker run --rm -v .:/data:rw --user $(id -u):$(id -g) pandoc/core -t docx "$f" -o "${f:0:-3}.docx"; done
```

You should end up with a lot of .docx files in the same folder as the .md files, and with the same name, but .docx extension.

This may take some time, and you may not see progress if you have a lot of files. If you do an \`ls\` in the same folder from another session, you should see DOCX files appearing.

You can use other file types other than DOCX if you like. Just change the \`-t docx\`. You can see the list of formats in the official documentation here: <https://pandoc.org/MANUAL.html#general-options>
