---
pubDatetime: 2021-06-10T20:32:51Z
modDatetime: 2021-06-10T20:33:55Z
title: "Ansible and Linux Mint"
tags:
  - "ansible"
  - "Linux"
description: "When running an Ansible playbook on a Linux Mint host I found that the variable distribution_release returned the Mint code name of ulyssa . This isn't ver"
---
When running an Ansible playbook on a Linux Mint host I found that the variable `distribution_release` returned the Mint code name of `ulyssa`. This isn't very helpful with adding things like hte docker repository as that needs the underlying Ubuntu codename.

To get the Ubuntu code name I resorted to reading the `/etc/os-releases` file.

```
---
  - name: Create a temporary file
    ansible.builtin.tempfile:
      prefix: .fetched_
      state: file
    register: tempfile

  - name: Fetch os-release
    ansible.builtin.fetch:
      src: /etc/os-release
      dest: "{{ tempfile.path }}"
      flat: yes
    register: fetched

  - name: Set Ubuntu Code Name
    set_fact:
      ubuntu_codename: "{{ lookup('ini', 'UBUNTU_CODENAME type=properties file=' + fetched.dest) }}"
```

```
---
  - name: Add Docker Repository
    apt_repository:
      repo: "deb [arch=amd64] https://download.docker.com/linux/ubuntu {{ ubuntu_codename }} stable"
      state: present
    when: ubuntu_codename is defined
    register: docker_list
```

This fetches the file into a random named temporary file - so as not to clash if our task is running on multiple hosts simultaneously. It then carries out a `lookup` for the property `UBUNTU_CODENAME` in the temporary file and sets a new variable `ubuntu_codename` which we can now use as our real code name.
