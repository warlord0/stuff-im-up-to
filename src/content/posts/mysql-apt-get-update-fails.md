---
pubDatetime: 2017-02-22T08:00:48Z
modDatetime: 2017-02-22T21:47:17Z
title: "MySQL Apt-Get Update Fails"
tags:
  - "Linux"
  - "mysql"
description: "Apt-get update fails because the PGP keys for the repository have expired. $ sudo apt-get update W: An error occurred during the signature verification. Th"
---
Apt-get update fails because the PGP keys for the repository have expired.

    $ sudo apt-get update

    W: An error occurred during the signature verification. The repository is not updated and the previous index files will be used. GPG error: http://repo.mysql.com jessie InRelease: The following signatures were invalid: KEYEXPIRED 1487236823 KEYEXPIRED 1487236823 KEYEXPIRED 1487236823

    W: Failed to fetch http://repo.mysql.com/apt/debian/dists/jessie/InRelease

    W: Some index files failed to download. They have been ignored, or old ones used instead.

Update the necessary key by adding it to your keystore

    $ sudo apt-key adv --keyserver pgp.mit.edu --recv-keys A4A9406876FCBD3C456770C88C718D3B5072E1F5

References: [https://bugs.mysql.com/bug.php?id=85029](https://bugs.mysql.com/bug.php?id=85029)
