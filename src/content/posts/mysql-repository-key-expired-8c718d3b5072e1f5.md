---
pubDatetime: 2019-05-01T07:44:24Z
title: "MySQL Repository Key Expired - 8C718D3B5072E1F5"
tags:
  - "Linux"
  - "mysql"
description: "Updates on my Stretch servers were failing due to an expired key. I tried the usual retrievals for keys using: $ sudo apt-key adv --keyserver keys.gnupg.ne"
---
Updates on my Stretch servers were failing due to an expired key. I tried the usual retrievals for keys using:

```
$ sudo apt-key adv --keyserver keys.gnupg.net --recv-keys 8C718D3B5072E1F5
```

Even searching the [keys.gnupg.net](https://keys.gnupg.net) key server didn't return the key.

As this failed I resorted to getting the key manually from the MySQL site and importing it into my apt keyring.

Apt was reporting the following errors:

```
Get:15 http://ftp.uk.debian.org/debian stretch/main Translation-en [5,384 kB]  
 Fetched 20.5 MB in 1min 8s (300 kB/s)                                          
 Reading package lists… Done
 W: An error occurred during the signature verification. The repository is not updated and the previous index files will be used. GPG error: http://repo.mysql.com/apt/debian jessie InRelease: The following signatures were invalid: EXPKEYSIG 8C718D3B5072E1F5 MySQL Release Engineering mysql-build@oss.oracle.com
 W: Failed to fetch http://repo.mysql.com/apt/debian/dists/jessie/InRelease  The following signatures were invalid: EXPKEYSIG 8C718D3B5072E1F5 MySQL Release Engineering mysql-build@oss.oracle.com
 W: Some index files failed to download. They have been ignored, or old ones used instead.
```

1.  Copy/download the GPG key from <https://dev.mysql.com/doc/refman/8.0/en/checking-gpg-signature.html>
2.  Save that into a file on the Debian server as `mysql.pub`.
3.  Import the new key into the apt keyring using:

```
$ sudo apt-key add mysql.pub    
```
