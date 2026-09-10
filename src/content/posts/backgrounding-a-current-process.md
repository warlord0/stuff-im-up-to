---
pubDatetime: 2025-03-31T15:19:05Z
title: "Backgrounding a Current Process"
tags:
  - "Linux"
description: "I was today years old when I learned I could background a running task, and exit the terminal to keep it running. I started a pgbackrest backup on a large"
---
I was today years old when I learned I could background a running task, and exit the terminal to keep it running.

I started a pgbackrest backup on a large database, and at 35% I realised that if I left for the day, I’d have to stop the job. Instead, I can suspend the process, change it to run in the background, and disown the process so I can close the terminal window. Now I can leave for the day - catch my train - and leave the backup to finish on its own.

- CTRL+Z to suspend the foreground/running process
- `bg` to continue running the suspended process in the background.
- `disown` to release the process so we can exit the terminal
