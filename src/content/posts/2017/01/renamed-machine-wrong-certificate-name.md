---
pubDatetime: 2017-01-27T11:08:44Z
modDatetime: 2017-01-27T17:22:28Z
title: "Renamed Machine & Wrong Certificate Name"
tags:
  - "certificates"
  - "ssl"
  - "Windows"
heroImage: "/blog-media/2016/09/windows-server-2012-1024x196.png"
description: "When we setup some virtual machines from a template and used temporary names for them because we needed to replace existing machines that were currently ru"
---
When we setup some virtual machines from a template and used temporary names for them because we needed to replace existing machines that were currently running on the domain, it seems the rename of the machine didn't fully do the job after we decommissioned the old and renamed the new. All the domain membership stuff went ok, but the certificate issued to the machine still had the temporary name. Even after deleting the wrongly named certificate we'd still get a certificate issued with the same name. A quick trawl in the registry revealed that the following key needed to be changed to get the correctly issued certificate:

    HKLM\SOFTWARE\Microsoft\Windows NT\CurrentVersion\Winlogon\DefaultDomainName

Once this was done the certificate was received with the correct name.
