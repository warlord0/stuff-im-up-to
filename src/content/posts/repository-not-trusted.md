---
pubDatetime: 2018-05-08T14:06:00Z
title: "Repository Not Trusted"
tags:
  - "debian"
  - "Linux"
description: "On a Wheezy box I saw this but was able to continue by answering yes to ignore the authentication warning. WARNING: The following packages cannot be authen"
---
On a Wheezy box I saw this but was able to continue by answering yes to ignore the authentication warning.

    WARNING: The following packages cannot be authenticated!

On a Stretch system, no can do. Apt was blocked from downloading updates.

    W: The repository 'http://ftp.uk.debian.org/debian stretch/updates Release' does not have a Release file.
    N: Data from such a repository can't be authenticated and is therefore potentially dangerous to use.
    N: See apt-secure(8) manpage for repository creation and user configuration details.
    E: The repository 'http://security.debian.org/debian-security stretch/updates Release' is no longer signed.
    N: Updating from such a repository can't be done securely, and is therefore disabled by default.
    N: See apt-secure(8) manpage for repository creation and user configuration details.

First i thought someone forgot to update their repository keys.

    $ sudo apt-key update

Nope. Still not downloading updates. So I tried download the `Release` file myself using wget - success. So then I tried to download the `Release.gpg` file using wget - failed with an HTTP status code 500! I could download all the files apart from the `.gpg` file. I checked the corporate proxy for errors and sure enough the `.gpg` files are being picked up by the Anti-Virus scanning. So a quick addition of a filter exception to disable the virus scanning for the Debian repository and my servers start updating again.
