---
pubDatetime: 2021-04-13T12:55:48Z
title: "Github and Deploy Keys"
tags:
  - "git"
  - "ssh"
  - "github"
  - "deploy keys"
heroImage: "/blog-media/2016/12/octocat.webp"
heroThumb: "/blog-media/2016/12/octocat-thumb.webp"
description: "Pull from several private GitHub repositories on one server by pointing git at a different SSH deploy key using GIT_SSH_COMMAND, core.sshCommand or an ssh config alias."
---
When it comes to pulling code from some of our private repositories we've configured a couple of systems with deploy keys. This allows them to pull the code, but not push. All we have to do is generate an ssh key and we add it to the Github repository and then we can happily clone and pull.

However, we've run into an issue where one system needs to be able to pull from more than one repository. The problem with this is that you can't use the same key on different repositories. This meant we had to generate a second ssh key on the host - easy enough - but how do we tell git to use which key when it pulls from each of the repositories?

We need to use a variable to change the command used for ssh, like so:

```
GIT_SSH_COMMAND='ssh -i ~/.ssh/deploykey_rsa -o IdentitiesOnly=yes' git pull
```

`GIT_SSH_COMMAND` is the environment variable that tells git which ssh command to run, so this is the ssh command git uses for that one pull. The `-i` picks the deploy key, and `IdentitiesOnly=yes` stops ssh offering any other keys it knows about (from `ssh-agent` or `~/.ssh/config`) so GitHub only ever sees the right one.

## Make it stick with core.sshCommand

Typing that variable every time gets old, so store it in the repository's own config instead (needs git 2.10 or later):

```
git config core.sshCommand 'ssh -i ~/.ssh/deploykey_rsa -o IdentitiesOnly=yes'
```

Now a plain `git pull` uses that key, and every repository on the server can have its own. To use a specific key for the very first clone, pass the setting on the command line:

```
git clone -c core.sshCommand='ssh -i ~/.ssh/deploykey_rsa -o IdentitiesOnly=yes' git@github.com:org/repo.git
```

## Or use an ssh config host alias

Another way to use a different ssh key per repository is to give each deploy key its own host alias in `~/.ssh/config`:

```
Host github-repo1
  HostName github.com
  User git
  IdentityFile ~/.ssh/deploykey_repo1
  IdentitiesOnly yes
```

Then clone using the alias in place of `github.com`, and git will use that key whenever it talks to that remote:

```
git clone git@github-repo1:org/repo1.git
```

*Search keywords: `GIT_SSH_COMMAND`, `SSH_COMMAND`, `core.sshCommand`, `IdentitiesOnly`, use a different ssh key with git, multiple deploy keys on one server, per-repository ssh key.*
