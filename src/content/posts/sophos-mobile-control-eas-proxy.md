---
pubDatetime: 2018-01-25T14:13:53Z
modDatetime: 2018-01-25T14:14:25Z
title: "Sophos Mobile Control EAS Proxy"
tags:
  - "Networking"
  - "Security"
  - "Windows"
heroImage: "/blog-media/2017/04/sophos_logo-svg.png"
description: "Up until this week we've been able to get away with a very simple SMC installation that proxies Exchange ActiveSync (EAS) from the one server with the base Sophos Mobile Control program without using a Standalone EAS Proxy."
---
Up until this week we've been able to get away with a very simple SMC installation that proxies Exchange ActiveSync (EAS) from the one server with the base Sophos Mobile Control program without using a Standalone EAS Proxy. But now we're moving towards Office 365 on the cloud the Microsoft ActiveSync gets messy. As we're in a hybrid setup where we have most users mailboxes on an internal Exchange 2013 instance and only a few on Office 365 the EAS Proxy part of SMC needs to know about more than one server/service to proxy to. Fortunately we operate a reverse proxy and we can deploy a scenario similar to that in section 4.2 of the "[Setting up the External EAS Proxy.pdf](https://sophserv.sophos.com/repo_kb/121658/file/Setting%20up%20the%20External%20EAS%20Proxy.pdf)". The only real difference here is that on the EAS Proxy server we setup two profiles. One for Exchange 2013 and the Other for Office 365. ![Selection_051](/blog-media/2018/01/selection_051.png) Then on the reverse proxy we point all traffic for the URL `/Microsoft-Server-ActiveSync` to the EASProxy server and the remaining traffic for the URL `/` to the SMC server. So now the SMC server only really handles communication to and from the *Sophos Mobile Control* client app. The EASProxy server does the heavy lifting of proxying MS-EAS traffic and works out if it needs to redirect the user to `outlook.office365.com`. But what I didn't find documented is the process Office 365 clients use. They no longer appear in the incoming log files for SMC or EAS Proxy. This is because they actually talk direct to the Office 365 servers. Access is still controlled, because SMC determines if the devices are compliant and it then uses PowerShell to update your external Office 365 cloud setup to allow the device access to the mailbox. Hence the need for the PowerShell (smc_powershell user) config when setting up Office 365 in SMC. SMC then only updates Office 365 about every 10 minutes. So you may appear compliant, but still can't access your mailbox until the Office 365 task updates the external servers.

## SSL Certificates

As we're using a reverse proxy we can get away with using a self signed or local certificate for the EAS Proxy service. The reverse proxy is the one that actually handles the SSL end point, so a valid certificate is on there instead.

> One word of warning when setting up the EAS Proxy or changing the config is to make sure you tick the "Use SSL for incoming connections (Clients to EAS Proxy)" every time. If you don't the clients will still try to use SSL and won't connect because the EAS Proxy whilst still listening on port 443, isn't SSL without it.

## Still unable to Sync with Office 365

At the time of writing there is a glitch in SMC's handling of Office 365. It fails to get the device `ActiveSync ID` and store it in SMC. This means you see entries in the accessLog_outlook.office365.com.xml log file with `accessPermission="UnknownActiveSyncId"`. So to fix this you need to copy the `deviceId` from this log and manually paste it into the SMC management web UI. From a Sophos support case: To do so, follow these steps:

1.  Log in to Sophos Central
2.  Go to Mobile
3.  Go to Setup \| General
4.  Enable the Show extended device details checkbox
5.  Save the changes
6.  Go to the Devices view and search for the device in question
7.  Click Edit
8.  Within the Custom properties tab, click Add custom property As the name use ActiveSync ID
9.  As the value use the ActiveSync ID value which you can find in the log, e.g. androidc1666070653
10. Save the changes

### References

[https://docs.sophos.com/esg/smc/8-0/admin/en-us/webhelp/PDF/smc_ig.pdf](https://docs.sophos.com/esg/smc/8-0/admin/en-us/webhelp/PDF/smc_ig.pdf) [https://sophserv.sophos.com/repo_kb/121658/file/Setting%20up%20the%20External%20EAS%20Proxy.pdf](https://sophserv.sophos.com/repo_kb/121658/file/Setting%20up%20the%20External%20EAS%20Proxy.pdf)
