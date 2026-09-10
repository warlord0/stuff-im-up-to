---
pubDatetime: 2018-12-04T09:25:44Z
modDatetime: 2018-12-04T09:48:17Z
title: "Cross Origin Resource Sharing and Content Security Policy"
tags:
  - "JavaScript"
  - "vmware"
  - "Web"
heroImage: "/blog-media/2016/10/vmware-logo-eps-vector-image-800x533-e1476948729563.png"
description: "Got to love having a vendor carrying out half a job... again. Having installed a new VMWare Horizon environment for Windows 10, I thought we'd at least hav"
---
Got to love having a vendor carrying out half a job... again.

Having installed a new VMWare Horizon environment for Windows 10, I thought we'd at least have Blast available via HTML  - which we don't currently have in our Windows 7 Horizon setup.

During the install I setup a [load balancer](/posts/vmware-horizon-load-balancing/) which only really handles the authentication process. This worked fine using IE or Edge, at which point I guess the vendor decided that's enough testing and it's considered functional. After they left I fired up my Chrome browser and found it didn't work. So I tried Firefox with the same non-functional result.

Checking the console log in Firefox I see:

```
Content Security Policy: The page's settings blocked the loading of a resource at wss://192.168.61.12:22443/d/36BC344E-DAD5-4EA5-A44C-12456F74432D/?vauth=LaQJrs2RppeiZGX9gOtj75vekprtuEDcgD2C6tba ("default-src").
```

A trawl of VMWare documentation results in: [https://docs.vmware.com/en/VMware-Horizon-7/7.6/horizon-security/GUID-FD679D1D-E037-4EDF-A96F-F0CD85FFE724.html](https://docs.vmware.com/en/VMware-Horizon-7/7.6/horizon-security/GUID-FD679D1D-E037-4EDF-A96F-F0CD85FFE724.html)

Now all I have to do is translate that to Nginx so I can put that into the config.

Editing my `ssl/snippets.conf` file and changing the CSP header, I added the missing parts for `wss:` and `blob:` to end up with:

```
add_header Content-Security-Policy "default-src 'self' wss:; script-src 'self' 'unsafe-inline' 'unsafe-eval'; img-src 'self'; style-src 'self' 'unsafe-inline'; font-src 'self'; frame-src https://horizon.domain.tld blob:; object-src 'none' blob:; connect-src 'self' wss:; child-src 'self' blob:;";
```

> A reload of Nginx and a refresh/reload on the browser and I'm into the Horizon Desktop!

### References

[https://docs.vmware.com/en/VMware-Horizon-7/7.6/horizon-security/GUID-94DAC7B8-70A3-4A91-8E70-2B2591B82866.html](https://docs.vmware.com/en/VMware-Horizon-7/7.6/horizon-security/GUID-94DAC7B8-70A3-4A91-8E70-2B2591B82866.html)

[https://www.owasp.org/index.php/Content_Security_Policy_Cheat_Sheet](https://www.owasp.org/index.php/Content_Security_Policy_Cheat_Sheet)
