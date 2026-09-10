---
pubDatetime: 2024-03-24T11:17:40Z
modDatetime: 2024-03-25T10:06:07Z
title: "Linting and Formatting with trunk.io"
tags:
  - "ansible"
  - "Linux"
heroImage: "/blog-media/2024/03/ansible_logo_2000.png"
description: "With a new job, new place of work, comes new challenges. The first task I set myself was to automate the deployment process for the video analytics softwar"
---
With a new job, new place of work, comes new challenges.

The first task I set myself was to automate the deployment process for the video analytics software using Ansible. I like Ansible, it's well-structured and relatively straight forward to understand. I've been using it for a while now, and it's my go-to automation platform.

I installed a fresh instance of VSCode, leaving behind my previous sync'd config, which meant all new plugins - some of my previous plugins may not be required in the new role - I started fresh. I started to install Ansible and ansible-lint plugins and tripped over [trunk.io/check](https://trunk.io/check) by accident. It came up and suggested it would format and lint everything I needed so far.

> [Trunk Check](https://trunk.io/check) runs 100+ tools to format, lint, static-analyze, and security-check dozens of languages and config formats. It will autodetect the best tools to run for your repo, then run them and provide results inline in VSCode.

I installed it and continued work on my Ansible project, building inventory and task files. Nothing really seemed to be doing much - until I tried doing a git commit. Trunk installed a series of git hooks, one of them a commit hook, and it started trying to check my code. There were far more failures that there should be. I know my code isn't great, but it would not commit because of way too many failures.

When I looked at the log files, I was seeing that most of the checks were failing because there was a missing dependency for `libcrypto.so.1`. Investigation led me to install `libxcrypt-compat` on Manjaro. I then manually ran `trunk check` and lots of things started to happen. More plugins got installed. It then successfully checked and formatted my code, but showed I had much to fix.

One of the plugins it installed is called [checkov](https://www.checkov.io). Apart from the usual missing LF at EOF and trailing spaces, it came up with `CKV2_ANSIBLE_3` - Ensure block is handling task errors properly. I had no idea what it meant. This is why I like linting and check tools, it helps you learn best practices. For all this time, I did not do any form of error handling in Ansible. All I had to do was to ensure I added a `rescue:` stanza to each `block:`, to ensure any error that was generated was responded to. For now, a simple response is all I needed, ie.

```
- name: My task
  block:
    ...
  rescue:
    - name: Something went wrong
      ansible.builtin.debug:
        msg: An error occured
      when: not ansible_check_mode
```
