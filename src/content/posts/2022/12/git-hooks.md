---
pubDatetime: 2022-12-05T08:27:33Z
modDatetime: 2022-12-05T08:30:02Z
title: "Git Hooks"
tags:
  - "ansible"
  - "git"
  - "Uncategorized"
heroImage: "/blog-media/2016/12/octocat.png"
description: "I wanted to ensure I wasn't pushing unencrypted data onto our Git repo. It's set as private anyhow, but the repo I'm using is for our Ansible library. It c"
---
I wanted to ensure I wasn't pushing unencrypted data onto our Git repo. It's set as private anyhow, but the repo I'm using is for our Ansible library. It contains all kinds of details about the builds of equipment and software delivery, that would be a risk. How do I ensure that I don't push variables up to the repo that contain sensitive data?

As I use Ansible vault to encrypt the data all I need to do is ensure I don't push variable data that hasn't passed through the vault. This means searching the files and finding those that do not contain the text `$ANSIBLE_VAULT`. Then stop the commit, until I fix them by encrypting with the vault secret.

I found some useful scripts online, the source was unknown, and I modified it a little to suit my needs.

#### pre-commit-check-encrypted

```
#!/bin/bash
#
# Ansible Vault Secrets Git Hook
#
# Hook to check if an un-encrypted FILE_PATTERN file is being commited. Useful if secrets
# are retained in ansible vault encrypted file(s) that should never be committed to the repository
# un-encrypted. Contact a repository owner for the ansible vault password.
#
# Put this file in .git/hooks/pre-commit

# set -o xtrace
set -o nounset

FILE_PATTERN="vars/"
ENCRYPTED_PATTERN="\$ANSIBLE_VAULT"

is_encrypted() {
    local file=$1
    if ! git show :"$file" | grep --quiet "^${ENCRYPTED_PATTERN}"; then
        printf "Located a staged file that should be encrypted:\n> %s\n" ${file}
        printf "Please un-stage this file. If you are adding or updating this file, please encrypt it before staging.\n"
        printf "Alternatively, you can git checkout the latest encrypted version of the file before committing.\n"
        printf "Remember... Only YOU Can Prevent Secret Leakage.\n"
        exit 1
    fi
}

echo "Running pre-commit checks..."
git diff --cached --name-only | grep "${FILE_PATTERN}" | while IFS= read -r line; do
    is_encrypted "${line}"
done
```

As my variables are in `host_vars`, `group_vars` and under the role `vars` folders, this should pick up any files that aren't encrypted and `exit 1` to prevent git from committing.

#### pre-commit-vault

```
#!/bin/bash

# If number of arguments is 0
if [ $# -eq 0 ]
then
    echo "This script will encrypt of decrypt all files containing secrets."
    echo "There are all files in vars as well as all secrets.yaml files under each service."
    echo "Specify 'decrypt' or 'encrypt' as argument"
    echo "If you put the vault password in a password file named ~/.ansible/secret, the script will not ask for a password."
    exit 1
fi

files=$(find . -type f -iwholename "*/vars/*.yml")
files="$files $(find . -type f -iwholename "group_vars/*.yml")"
files="$files $(find . -type f -iwholename "host_vars/*.yml")"

password_type=--ask-vault-password
if [ -f "$HOME/.ansible/secret" ]
then
    echo "Using secret file"
    if [ "$(stat -c %a "$HOME/.ansible/secret")" != "600" ]
    then
        echo "$HOME/.ansible/secret file has bad permissions; fixing this to 600"
        chmod 600 $HOME/.ansible/secret
    fi
    password_type="--vault-password-file $HOME/.ansible/secret"
fi

if [ "$1" == "encrypt" ]
then
    for value in $files; do
        echo "$value";
        ansible-vault encrypt $password_type $value
    done
    
elif [ $1 == "decrypt" ]
then
    for value in $files; do
        echo "$value";
        ansible-vault decrypt $password_type $value
    done
else
    echo "Wrong argument supplied.  Run without arguments to see allowed ones."
fi
```

Using the `pre-commit-vault` script, I can `encrypt` or `decrypt` all files in one pass. The modification I made was to iterate each file individually. This is because for some reason I ended up with a single unencrypted file, then the `ansible-vault` call to `encrypt` would fail as it encounters a file that is already encrypted. Now it simply continues, file by file.
