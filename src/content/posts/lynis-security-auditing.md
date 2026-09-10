---
pubDatetime: 2020-05-29T09:12:30Z
title: "Lynis Security Auditing"
tags:
  - "ansible"
  - "Linux"
  - "Security"
heroImage: "/blog-media/2017/02/download-10-e1488295217214.jpg"
description: "In the days of corporate lore I faced system hardening challenges driven by Nessus. Now because Nessus isn't FOSS (Free Open Source Software) it's not some"
---
In the days of corporate lore I faced system hardening challenges driven by Nessus. Now because Nessus isn't FOSS (Free Open Source Software) it's not something I can use in my current role. There is an Open Source fork from Greenbone - but there's some attractive thinking into using Lynis as a build validation tool.

> Lynis is a battle-tested security tool for systems running Linux, macOS, or Unix-based operating system. It performs an extensive health scan of your systems to support system hardening and compliance testing. The project is open source software with the GPL license and available since 2007.
>
> https://cisofy.com/lynis/#introduction

First off it's VERY easy to use. It doesn't require a server and can be pulled down from github and run with no compilation required.

Once you clone the repository to your system you can even run it to scan remote systems, well I should say if you try to run in to do a remote scan it gives you all the commands you need to carry out a remote scan.

The report it spits out is very comprehensive and has links to web pages explaining what the suggestions to resolve the found issue are. In the community edition the suggestions are more clues about what needs to be done and seems to suggest the enterprise version is more comprehensive.

## Using Lynis with Ansible

As I run Lynis and gather reports about suggested remedies I've started to fix them using Ansible. This way I can build up a set of Ansible tasks that I can apply as best practice to all future deployments, and maybe even retrospectively.

For example many of the suggestions recommend the use of accounting features to enable you to monitor the performance and activities on the server. I created an Ansible task to apply those suggestions:

#### ACCT,yml

```
---
- name: ACCT-9622 Enable process accounting
  service:
    name: acct
    enabled: yes
    state: started

- name: ACCT-9626 sysstat collecting accounting
  service:
    name: sysstat
    enabled: yes
    state: started

- name: ACCT-9626 sysstat enabled
  lineinfile: 
    path: /etc/default/sysstat
    line: 'ENABLED="true"'    
    regexp: '^ENABLED='
    state: present

- name: ACCT-9632 auditd configured
  service:
    name: auditd
    enabled: yes
    state: started    
```

This snippet ensures the accounting services are enabled and started. There are also packages that are suggested to be installed which I put in `PKGS.yml`. I've built a role with all the tasks I discover and will expand upon.

[https://github.com/OpusVL/ansible-lynis](https://github.com/OpusVL/ansible-lynis)
