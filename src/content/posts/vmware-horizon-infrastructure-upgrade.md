---
pubDatetime: 2017-01-04T14:34:28Z
modDatetime: 2017-01-06T18:15:41Z
title: "VMware Horizon Infrastructure Upgrade"
tags:
  - "horizon"
  - "Linux"
  - "vmware"
  - "Windows"
description: "Upgrading VMware Horizon is going to be a fun task for the weekend. It means upgrading 3 connection servers, a security server, the vcenter server and the composer server. This is all so we can disable SSLv3 on the ESXi hosts they all run on."
---
Upgrading VMware Horizon is going to be a fun task for the weekend. It means upgrading 3 connection servers, a security server, the vcenter server and the composer server. This is all so we can disable SSLv3 on the ESXi hosts they all run on. Migration was originally planned from 5.3 to 6.2, as this is the earliest version that resolves the SSLv3 problem. But if we're going to have to upgrade, why not go all the way to v7? There's lot's of help and instruction to be had on the net on how to plan and deploy, but the plan we're aiming for gives us an easy backout plan that then resolves all of the version upgrades required by Windows and MSSQL on the current infrastructure. The plan is simply to turn off the old systems, reinstall new ones and migrate data. This way if we need to chicken out we turn off all the new and turn on all the old. So all the new servers will have the same IP addresses and names as the ones they are replacing. This way we have no concerns about the various firewalls and rules that relate to Horizon.

## Plan of attack

1.  Install 6 new virtual servers with Windows 2012R2
2.  Install a new v7 connection server as a replica server to be able to manage Horizon from
3.  Turn off the Windows 2008 security server
4.  Turn off the Windows 2008 connection servers
5.  Check composer server by managing Horizon using the "new" connection server
6.  Stop composer and database services on composer server\*
7.  Take a snap shot of the composer server
8.  Restart the composer and database services on composer server
9.  Run the v7 upgrade of composer services on the composer server
10. Test the new composer services using the connection server
11. Stop the composer services (leave database running)
12. Backup the composer database putting it somewhere safe
13. Turn off the composer server
14. Bring up a new Windows server for composer
15. Install MSSQL 2012 onto "new" composer server
16. Install v7 composer services
17. Restore composer database backup to new server
18. Test the new composer server and services using the connection server
19. Use the VMware migration tool to migrate the Windows vcenter server to a vcenter appliance
20. Turn off the Windows vcenter server
21. Install the remaining connection servers
22. Install the security server

All being well everything should be pretty much live. Now all that needs taking care of is VMware tools on the gold images and the Group Policy ADM updates.

### Notes

The certificate on the security server needs to be an external certificate with a friendly name of "vdm" The certificate on the composer server can be an internal certificate and has a friendly name of "vrm"

- We've decided that as we only operate 4 pools from 4 "gold" images that we're just going to drop the existing composer server from the configuration and install a new v7 one. Then just recreate the pools based on the settings we have from the existing pools.

### References

Update sequence for vSphere 6.0 [https://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=2109760](https://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=2109760) Migrating composer database [https://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=2051921](https://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=2051921) Upgrading to Horizon 6.0 [https://elgwhoppo.com/2014/09/07/upgrading-to-horizon-6-part-1-prepwork/](https://elgwhoppo.com/2014/09/07/upgrading-to-horizon-6-part-1-prepwork/)
