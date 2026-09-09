---
pubDatetime: 2019-09-18T21:32:32Z
title: "Git Credentials"
tags:
  - "git"
  - "Linux"
  - "Windows"
description: "Using git to push commits up to the remote is all in a days work. The change happens when you switch to a new remote and use a new account. My first action"
---
Using git to push commits up to the remote is all in a days work. The change happens when you switch to a new remote and use a new account.

My first actions where to change the remote for my local project. This is easy enough using `git remote set-url origin [url]`. It was only when I went to push this project up to the new remote repository that I found I was being denied with a 403 error, which means permission denied.

The big reason for the problem was a change from `ssh` to `https`. Using `ssh` was pretty straight forward, as long as you have your key and it is registered in your `.gitconfig` for the host your pushing to the credentials are pretty robust.

I'd take a step toward running the remotes on `https` due to firewall and proxy issues that meant `https` should be easier.

But because `ssh` keys can make life easier by not having a key password (cool, unless your user password is weak), the change to `https` means you need to provide credentials on each push.

This is where you need to start looking at [Git Credentials Storage](https://git-scm.com/book/en/v2/Git-Tools-Credential-Storage).

Under Linux you can specify a credentials file that will feed your details into the process. The file should be placed somewhere every secure and with the correct permissions to ensure it isn't misused. For instance as a hidden file under your home directory with nly you having permission to access it.

eg.

```
$ touch  ~/.my-credentials
£ chmod 600  ~/.my-credentials
$ git config credential.helper 'store --file ~/.my-credentials'
```

> But with Windows things actually get a bit easier! *Which is hard for a Linux head to accept :)*

The git helper for Windows means that your credentials get stored with your windows account.

```
$  git config credential.helper manager
```

Because I changed remotes and changed the account I was using, under Windows I needed to remove my old credentials. This is easy enough. I just brought up the start menu and type "*credentials*". Then I chose the option for "*Manage Windows Credentials*". In the list of generic credentials I could see my old account and simply removed it. The next time I pushed I was asked for new credentials which then got added into the list for me.
