---
pubDatetime: 2021-08-18T11:13:20Z
modDatetime: 2021-08-25T12:47:59Z
title: "Random Time in a Cron Job"
tags:
  - "Linux"
description: "I wanted to trigger a cron that ran a task between a certain window, but wanted it to run at a random time to minimize clashes with other systems. This is"
---
I wanted to trigger a cron that ran a task between a certain window, but wanted it to run at a random time to minimize clashes with other systems.

This is what I came up with in pure bash.

```
0 0 * * * root sleep $(( $RANDOM \% 43200 + 1)) && certbot -q renew
```

Which equates to at midnight as the user root, sleep for a random amount of time between 1 and 43200 seconds (43200 seconds = 12 hours) and then run the certbot renewal command.

You need the `%` escaping with, `\` as cron will convert `%` to a newline if you don't, and that will cause your script to fail.

> The `command` field (the rest of the line) is the command to be run. The entire command portion of the line, up to a newline or % character, will be executed by */bin/sh* or by the shell specified in the `SHELL` variable of the `crontab`. Percent signs (‘`%`’) in the command, unless escaped with a backslash (‘`\`’), will be changed into newline characters, and all data after the first ‘`%`’ will be sent to the command as standard input.
>
> http://man.openbsd.org/crontab.5

## References

[https://unix.stackexchange.com/a/390668](https://unix.stackexchange.com/a/390668)
