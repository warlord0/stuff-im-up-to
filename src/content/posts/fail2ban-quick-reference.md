---
pubDatetime: 2017-07-20T11:04:40Z
title: "Fail2ban - Quick Reference"
tags:
  - "Linux"
  - "Security"
heroImage: "/blog-media/2017/02/download-10-e1488295217214.jpg"
description: "List your jails: $ sudo fail2ban-client status Show a particular jails status: $ sudo fail2ban-client status [JAILNAME] Unban an IP Address from the jail:"
---
List your jails:

    $ sudo fail2ban-client status

Show a particular jails status:

    $ sudo fail2ban-client status [JAILNAME]

Unban an IP Address from the jail:

    $ sudo fail2ban-client set [JAILNAME] unbanip [IPADDRESS]
