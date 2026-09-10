---
pubDatetime: 2023-05-22T21:18:57Z
modDatetime: 2023-05-22T21:23:31Z
title: "Ansible Vault and Lint Errors"
tags:
  - "ansible"
  - "Security"
  - "vscode"
heroImage: "/blog-media/2020/02/ansible800.png"
description: "Using the VS Code plugin for Ansible, I'm getting an internal error when it lints a YAML file. I know the syntax is OK, as I can run an ansible-playbook wi"
---
Using the VS Code plugin for Ansible, I'm getting an internal error when it lints a YAML file. I know the syntax is OK, as I can run an `ansible-playbook` with `--syntax-check` and it works.

But then I'm using a command line that also includes my Ansible vault password file:

```
ansible-playbook -i inventory.yml --syntax-check desktop-playbook.yml --vault-password-file=~/.ansible/secret
```

The VS Code linter, doesn't do this. So if I repeat the call without the vault password file, I get:

```
ansible-playbook -i inventory.yml --syntax-check desktop-playbook.yml                                  
ERROR! Attempting to decrypt but no vault secrets found
```

To solve the puzzle, you need to edit `/etc/ansible/ansible.cfg`, and put your vault file in the config:

```
vault_password_file = ~/.ansible/secret
```

Now, when you run the `--syntax-check` without the `--vault-password-file` parameter, it should work. Meaning, the VS Code lint should work also.

## References

[Ansible Lint Documentation](https://ansible-lint.readthedocs.io/rules/internal-error/)

[https://github.com/ansible/ansible-lint/issues/115#issuecomment-774472336](https://github.com/ansible/ansible-lint/issues/115#issuecomment-774472336)
