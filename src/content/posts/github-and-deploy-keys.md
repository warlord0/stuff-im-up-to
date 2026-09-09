---
pubDatetime: 2021-04-13T12:55:48Z
title: "Github and Deploy Keys"
tags:
  - "git"
  - "Uncategorized"
description: "When it comes to pulling code from some of our private repositories we've configured a couple of systems with deploy keys. This allows them to pull the cod"
---
When it comes to pulling code from some of our private repositories we've configured a couple of systems with deploy keys. This allows them to pull the code, but not push. All we have to do is generate an ssh key and we add it to the Github repository and then we can happily clone and pull.

However, we've run into an issue where one system needs to be able to pull from more than one repository. The problem with this is that you can't use the same key on different repositories. This meant we had to generate a second ssh key on the host - easy enough - but how do we tell git to use which key when it pulls from each of the repositories?

We need to use a variable to change the command used for ssh, like so:

```
GIT_SSH_COMMAND='ssh -i ~/.ssh/deploykey_rsa -o IdentitiesOnly=yes' git pull
```
