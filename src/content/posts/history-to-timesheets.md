---
pubDatetime: 2020-07-29T15:57:57Z
modDatetime: 2020-07-29T18:42:04Z
title: "History to Timesheets"
tags:
  - "Linux"
heroImage: "/blog-media/2020/02/tux-1.png"
description: "I'm not great at remembering what I did so I can include it on my time logger. I found I could trawl through my zsh history file to get an idea of what I'd"
---
I'm not great at remembering what I did so I can include it on my time logger. I found I could trawl through my zsh history file to get an idea of what I'd been up to and use it as a memory jogger to go back in time and update my timesheet.

By using a mixture of `sed` and `awk` I was able to grab the columns from the `~/.zsh_history` file. I can import this into a spreadsheet and then use a formula to convert the epoch date format to a proper date/time I can read.

The first part of the process I need to deal with the multiline history commands I've used. These end with a `\\` and new line and need to be made into a single line to be processed by `awk`.

```
sed ':a;N;$!ba;s/\\\n/\\/g' ~/.zsh_history
```

If that looks like gibberish to you, it means scan the `~/.zsh_history` and replace `\+newline` with `\`. Lots of escape sequences, newline and a regex make for hard reading.

Next I need to pipe it through `awk` because I need to make it into fixed width data and only output the columns I need.

```
| awk 'BEGIN { FIELDWIDTHS = "2 10 3 999" } {gsub(/"/, "\"\"", $4)} { printf "%s,,\"%s\"\n",$2,$4 }'
```

This sets the column widths at 2, 10, 3 and 999. and as it processes each line `gsub` replaces quotes with two quotes. We only want the date and the command and they are in columns 2 and 4 (\$2 \$4), which we use `printf` to format them so the commands are surrounded by quotes and a newline at the end.

Put it all together:

```
sed ':a;N;$!ba;s/\\\n/\\/g' ~/.zsh_history | awk 'BEGIN { FIELDWIDTHS = "2 10 3 999" } {gsub(/"/, "\"\"", $4)} { printf "%s,\"%s\"\n",$2,$4 }' > history.csv
```

Then I run it and can open the history.csv file with as a spreadsheet. Tell it that I'm using comma separated and a string delimiter as a double quote and I get a spreadsheet with three columns - the epoch date, and empty column, and the command used.

In the empty column I am going to put in the following formula to convert the epoch date to a real date.time.

```
=A1/86400+25569
```

I can then format the cell to a date time and choose to display it as `Date 31 Dec 99` and now I can use that all down that column for meaningful and filterable date times.
