---
pubDatetime: 2025-04-08T14:59:02Z
title: "Ansible on Steroids!"
tags:
  - "ansible"
  - "automation"
  - "devops"
  - "Linux"
heroImage: "/blog-media/2024/03/ansible_logo_2000.png"
description: "Mitogen Mitogen is a program that miraculously speeds up the remote execution of Python scripts. It also has an Ansible plugin. At first, I thought it look"
---
## Mitogen

Mitogen is a program that miraculously speeds up the remote execution of Python scripts.

It also has an Ansible plugin. At first, I thought it looked too complicated to set up, so I let it go. Eventually, I found a post that described just how easy it was to configure.

### Download the Code

`wget https://files.pythonhosted.org/packages/source/m/mitogen/mitogen-0.3.22.tar.gz`

Extract it into a fodder of your choice. I simply put it in my home folder.

`tar xvzf mitogen-0.3.22.tar.gz`

### Add the Plugin to your Ansible Config

I went for editing my `~/.ansible.cfg` and adding the settings there. I have a few other performance items in there, like pipelining and some SSH parameters.

```
[defaults]
vault_password_file = ~/.ansible/secret
pipelining = True
host_key_checking = False
strategy_plugins = ~/mitogen-0.3.22/ansible_mitogen/plugins/strategy
strategy = mitogen_linear

[ssh_connection]
ssh_args = -o ControlMaster=auto -o ControlPersist=60s -o ControlPath=/tmp/ssh-control-%h
```

As you can see, all I did was add it to my config, I haven’t changed any playbooks or Ansible tasks etc.

## The Evidence

Before the config changes and addition of mitogen.

```
$ time ansible-playbook playbook.yml -i inventory.yml --limit my-host --tags icinga2

________________________________________________________
Executed in   45.77 secs    fish           external
   usr time    5.79 secs  945.00 micros    5.79 secs
   sys time    2.24 secs  180.00 micros    2.24 secs
```

After

```
$ time ansible-playbook playbook.yml -i inventory.yml --limit my-host --tags icinga2

________________________________________________________
Executed in   14.16 secs    fish           external
   usr time    2.68 secs   12.99 millis    2.67 secs
   sys time    0.58 secs   15.29 millis    0.56 secs
```

These are a selection of small tasks, but you can see it goes from 45s down to only 15s. That’s three times faster with no changes to my tasks.

Quite a saving with just one host. If we’re running this on many hosts, it’s a huge saving.

## References

[https://mitogen.networkgenomics.com/ansible_detailed.html](https://mitogen.networkgenomics.com/ansible_detailed.html)

[https://github.com/mitogen-hq/mitogen/](https://github.com/mitogen-hq/mitogen/)

[https://dev.to/sshnaidm/speed-up-ansible-with-mitogen-2c3j](https://dev.to/sshnaidm/speed-up-ansible-with-mitogen-2c3j)
