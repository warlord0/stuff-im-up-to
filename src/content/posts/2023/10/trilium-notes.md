---
pubDatetime: 2023-10-26T08:04:53Z
title: "Trilium Notes"
tags:
  - "Linux"
  - "Web"
  - "Windows"
heroImage: "/blog-media/2023/10/image.png"
description: "Excellent note-taking app. Only calling a note-taking app seems to heavily understate what it is. It's like a personal version of a Markdown document repos"
---
Excellent note-taking app. Only calling a note-taking app seems to heavily understate what it is. It's like a personal version of a Markdown document repository, that stores notes in a manageable structure.

I first tried to use it as a native installation on Manjaro, but it seems to include electron and a huge amount of other dependencies. Instead, I went for the docker installation. Installed in seconds and up and running in no time. The best bit is it's also available to use in any web browser I can connect to my network with.

![Trilium](/blog-media/2023/10/image.png)

The docker compose is very simple and can be tweaked to suit ports and storage location as you like.

```
version: '3.7'

services:
  trilium:
    image: zadam/trilium
    volumes:
      - "${PWD}/data:/home/node/trilium-data:rw"
    ports:
      - "8080:8080"
```

Then visit [http://localhost:8080](#) and give it a password.
