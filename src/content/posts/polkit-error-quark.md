---
pubDatetime: 2022-03-04T18:02:14Z
title: "polkit-error-quark"
tags:
  - "ansible"
  - "Linux"
  - "manjaro"
  - "Security"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "I caused myself a few hours of frustration today. I installed a new instance of Manjaro today, and it applied some Lynis security suggestions that I didn't"
---
I caused myself a few hours of frustration today. I installed a new instance of Manjaro today, and it applied some Lynis security suggestions that I didn't fully realise the impact of.

> **Error registering authentication agent: GDBus.Error:org.freedesktop.PolicyKit1.Error.Failed: Cannot determine user of subject (polkit-error-quark, 0)**

When I went to run pamac to install Visual Studio Code it complained and failed to install, with the error above. After many trawls through possible solutions, I came across this:

https://opentechy.com/how-to-fix-gdbus-errororg-freedesktop-policykit1-error-failed/

It's for Centos, but it gave me the clue I need. I remounted `proc` and restarted `polkit` using:

```
sudo mount -o remount,rw,hidepid=2,gid=proc /proc
sudo systemctl restart polkit
```

Then retried `pamac` and success.

Looking at the Lynis suggestion: \[[File-6344](https://cisofy.com/lynis/controls/FILE-6344/)\], the fix I used was this:

```
- name: Set /proc hidepid=2
  lineinfile:
    path: /etc/fstab
    regexp: '^proc\s+'
    line: "proc    /proc        proc        defaults,hidepid=2    0 0"
    state: present
  notify:
    - reboot
```

I added another block to handle Manjaro/Arch

```
- name: Set /proc hidepid=2 (Manjaro)
  lineinfile:
    path: /etc/fstab
    regexp: '^proc\s+'
    line: "proc    /proc        proc        defaults,hidepid=2,gid=proc    0 0"
    state: present
  notify:
    - reboot
  when: ansible_distribution == 'Archlinux'
```

By default, there is no `proc` entry in `fstab` - removing it actually solves the problem, but doesn't answer the security issue. Adding the `gid=proc` solves both.
