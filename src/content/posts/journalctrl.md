---
pubDatetime: 2022-12-03T19:12:45Z
title: "journalctrl"
tags:
  - "Linux"
description: "Shortcuts to getting meaningful data from journalctrl Specific time frame journalctrl --since \"18:00\" --until \"18:03\" More descriptive times journalctrl --"
---
Shortcuts to getting meaningful data from `journalctrl`

Specific time frame

```
journalctrl --since "18:00" --until "18:03"
```

More descriptive times

```
journalctrl --since "10 minutes ago"
```

Boot times

```
journalctl --list-boots
```

Since the current boot - 0

```
journalctl --boot 0
```

By error level/priority

```
0: emergency
1: alert
2: critical
3: error
4: warning
5: notice
6: info
7: debug
```

Errors since boot

```
journalctl --boot 0 --priority 3
```

For a particular unit only

```
journalctl --unit sshd
```

Built in `grep`

```
journalctl --grep "session opened"
```

Follow the journal log in real time

```
journalctl --follow
```

Space used by journal logs

```
journalctl --disk-usage
```

Shrink usage

```
journalctl --vacuum-time 7d
journalctl --vacuum-size 100M
```
