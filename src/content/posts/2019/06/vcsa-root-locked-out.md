---
pubDatetime: 2019-06-07T14:24:39Z
modDatetime: 2019-06-07T14:29:56Z
title: "VCSA root Locked Out!"
tags:
  - "Linux"
  - "Security"
  - "ssh"
  - "vmware"
heroImage: "/blog-media/2016/10/vmware-logo-eps-vector-image-800x533-e1476948729563.png"
description: "This gave me cause for tears today. The VCSA (vCenter Server Appliance) management Web UI ( https://vcsa:5480 ) decided not to let me in as root. I'm guess"
---
This gave me cause for tears today. The VCSA (vCenter Server Appliance) management Web UI ([https://vcsa:5480](https://vcsa:5480)) decided not to let me in as root. I'm guessing I spannered the password a few too many times.

It's a very good job that at some point in the past I put my public key onto the system so I could use my plain old no password required private key to logon to the system using ssh!

[SSH Logon with Private Key](https://warlord0blog.wordpress.com/2017/03/01/ssh-logon-with-private-key/)

Now I'm logged onto the console how do I go about getting access back to the Web UI? I discovered that the VCSA system uses `pam_tally2` to lockout sessions. What I needed to do was reset the root account:

```
# pam_tally2 --user=root
 Login           Failures Latest failure     From
 root               10    06/07/19 14:12:11  unknown
# pam_tally2 --user=root --reset
 Login           Failures Latest failure     From
 root               10    06/07/19 14:12:11  unknown
# pam_tally2 --user=root
 Login           Failures Latest failure     From
```

Now I can logon to the Web UI!

> The lesson to learn here is to install your public key onto your precious Linux boxes!
