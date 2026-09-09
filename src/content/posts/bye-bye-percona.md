---
pubDatetime: 2017-05-25T13:14:31Z
title: "Bye, bye, Percona"
tags:
  - "Linux"
  - "mysql"
description: "For quite a few years we'd been running Percona on our Nagios server with no issues. So no reason to change, until sometime over the past few days the repo"
---
For quite a few years we'd been running Percona on our Nagios server with no issues. So no reason to change, until sometime over the past few days the repository's public key expired and automated updates were failing. I tried to update the key, searching key servers and eventually gave up. I resorted to removing the repo's from my apt `sources.list`. Then I just installed the MySQL apt repo and installed MySQL. As it installs it warns you about having a backup as data already exists and may be lost after the install. However, for me it simply removed Percona for me, installed MySQL and was up and running without any issue.

> So it maintained all my users, schemas and tables and performed as expected.

Not that there's anything wrong with Percona, just that I took the easy option of going with what the majority of our install base uses.
