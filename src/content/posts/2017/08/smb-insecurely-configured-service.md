---
pubDatetime: 2017-08-17T13:07:40Z
modDatetime: 2017-08-17T13:25:43Z
title: "SMB Insecurely Configured Service"
tags:
  - "Security"
  - "Windows"
heroImage: "/blog-media/2016/10/nessus-logo-e1475580279964.png"
description: "For the first time today I ran into Nessus plugin ID 44676. It highlighted an \"insecurely configured Windows service\". This related to a Service Discretion"
---
For the first time today I ran into Nessus plugin ID 44676. It highlighted an "insecurely configured Windows service". This related to a Service Discretionary Access Control List (DACL), which is a whole bag of new to me. The guidance shows how you can use the command line to show the DACL for the service it reported the issue with.

> The following service has insecure group permissions: Bacway Windows Service (BacwayService) : - Authenticated Users: DC

More information is given here: [https://support.microsoft.com/en-us/help/914392/best-practices-and-guidance-for-writers-of-service-discretionary-acces](https://support.microsoft.com/en-us/help/914392/best-practices-and-guidance-for-writers-of-service-discretionary-acces) It's all still a bit foreign to me. After a bit of a trawl I figured once I got the current DACL I'd just change it to remove the "DC" permission from the "Authenticated Users". List the DACL using

    C:\> sc sdshow BacwayService

Which returns:

    D:(A;;CCDCLCSWRPWPDTLOCR;;;AU)(A;;CCLCSWRPWPDTLOCRRC;;;SY)(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;BA)(A;;CCLCSWLOCRRC;;;IU)(A;;CCLCSWLOCRRC;;;SU)S:(AU;FA;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;WD)

The only bit I'm interested in is the "AU" part which is the Authenticated Users:

    ... (A;;CCDCLCSWRPWPDTLOCR;;;AU) ...

Within the list of permissions is the pair "DC" which is the bit listed by Nessus. So I edited the string and removed DC. Then used sdset to change the DACL, passing it the entire edited string.

    C:\> sc sdset BacwayService D:(A;;CCLCSWRPWPDTLOCR;;;AU)(A;;CCLCSWRPWPDTLOCRRC;;;SY)(A;;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;BA)(A;;CCLCSWLOCRRC;;;IU)(A;;CCLCSWLOCRRC;;;SU)S:(AU;FA;CCDCLCSWRPWPDTLOCRSDRCWDWO;;;WD)

Now rescanning with Nessus shows the issue is no longer there.
