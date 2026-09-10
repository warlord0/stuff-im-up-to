---
pubDatetime: 2017-07-21T10:38:02Z
title: "Squid3 changes for Debian Jessie"
tags:
  - "ldap"
  - "Linux"
  - "Networking"
  - "proxy"
heroImage: "/blog-media/2016/11/squid_logo.png"
description: "I upgraded our Squid3 proxy server to Debian Jessie today. The process as usual was pretty painless until the Squid3 service tried to restart. Then I saw w"
---
I upgraded our Squid3 proxy server to Debian Jessie today. The process as usual was pretty painless until the Squid3 service tried to restart. Then I saw what looked like a world of hurt from the syslog output.

> The memberof helpers are crashing too rapidly, need help!

    Jul 21 10:57:26 squid systemd[1]: Started LSB: Squid HTTP Proxy version 3.x.
    Jul 21 10:57:26 squid squid3[1918]: .
    Jul 21 10:57:26 squid squid3[1949]: Squid Parent: will start 1 kids
    Jul 21 10:57:26 squid squid3[1949]: Squid Parent: (squid-1) process 1951 started
    Jul 21 10:57:26 squid (squid-1): The memberof helpers are crashing too rapidly, need help!
    Jul 21 10:57:26 squid squid[1949]: Squid Parent: (squid-1) process 1951 exited with status 1
    Jul 21 10:57:29 squid squid[1949]: Squid Parent: (squid-1) process 1959 started
    Jul 21 10:57:29 squid (squid-1): The memberof helpers are crashing too rapidly, need help!
    Jul 21 10:57:29 squid squid[1949]: Squid Parent: (squid-1) process 1959 exited with status 1
    Jul 21 10:57:32 squid squid[1949]: Squid Parent: (squid-1) process 1967 started
    Jul 21 10:57:32 squid (squid-1): The memberof helpers are crashing too rapidly, need help!
    Jul 21 10:57:32 squid squid[1949]: Squid Parent: (squid-1) process 1967 exited with status 1
    Jul 21 10:57:35 squid squid[1949]: Squid Parent: (squid-1) process 1975 started
    Jul 21 10:57:35 squid (squid-1): The memberof helpers are crashing too rapidly, need help!
    Jul 21 10:57:35 squid squid[1949]: Squid Parent: (squid-1) process 1975 exited with status 1
    Jul 21 10:57:38 squid squid[1949]: Squid Parent: (squid-1) process 1983 started
    Jul 21 10:57:38 squid (squid-1): The memberof helpers are crashing too rapidly, need help!
    Jul 21 10:57:38 squid squid[1949]: Squid Parent: (squid-1) process 1983 exited with status 1
    Jul 21 10:57:38 squid squid[1949]: Squid Parent: (squid-1) process 1983 will not be restarted due to repeated, frequent failures
    Jul 21 10:57:38 squid squid[1949]: Exiting due to repeated, frequent failures

But in reality this was pretty straight forward to resolve. Squid have renamed a number of helper programs which causes the memberof function to fail. So when it tries to use Kerberos or LDAP to establish group membership the program it's looking for isn't there. A quick edit of the `/etc/squid3/squid.conf` to change the old names to the new and restart the service. Look for programs in the path `/usr/lib/squid3/` called `squid_kerb_auth` and replace it with `negotiate_kerberos_auth`. Then replace `squid_ldap_auth` with `basic_ldap_auth`. Finally the LDAP lookups, find `squid_ldap_auth` and replace it with `ext_ldap_group_acl`. Thankfully all the parameters seem to be the same so my previous settings just worked with the new names.
