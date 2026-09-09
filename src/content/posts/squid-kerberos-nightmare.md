---
pubDatetime: 2017-07-25T12:38:56Z
title: "Squid Kerberos Nightmare"
tags:
  - "Linux"
  - "proxy"
  - "Security"
  - "Windows"
description: "What a terrible sequence of events we suffered today. Took quite a bit of head scratching, log reading and plenty of Google fu to resolve. We use Squid wit"
---
What a terrible sequence of events we suffered today. Took quite a bit of head scratching, log reading and plenty of Google fu to resolve. We use Squid with an LDAP and authenticated lookup to establish if a user is a member of an AD group to allow them through the proxy. For some very strange reason the authentication and lookup began failing today. I suspect that in trying to resolve the underlying issue I broke some other things and then had to chase back through my squid.conf to repair the changes I'd made. But the underlying issue related to kerberos being unable to connect with the domain controller. I resorted to starting again with the kerberos setup by creating a new keytab file, which required me to remove the current squid AD machine accounts and this is where I discovered what the real problem was. I probably didn't need to recreate the keytab file at all as the fault lay on the Windows domain controller! For some bizare reason we had no Reverse DNS (PTR) entry for the domain controllers IP Address! No idea where it went, but it was at the point of trying to recreate the keytab file using msktutil that my Google fu discovered a post made by someone discovering the same issue. The post from 2011 that cracked this for me [http://www.squid-cache.org/mail-archive/squid-users/201104/0261.html](http://www.squid-cache.org/mail-archive/squid-users/201104/0261.html) After discovering that I added the PTR record to the domains DNS and retried msktutil and presto my keytab file got created. It was then just a case of following this process to get the squid proxy to operate as it should. [http://wiki.squid-cache.org/ConfigExamples/Authenticate/WindowsActiveDirectory](http://wiki.squid-cache.org/ConfigExamples/Authenticate/WindowsActiveDirectory)

### Things to be mindful of:

Make sure the permissions on your `ldappass.txt` file are correct (see above link)
