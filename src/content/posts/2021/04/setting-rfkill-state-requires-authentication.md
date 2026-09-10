---
pubDatetime: 2021-04-30T10:07:37Z
title: "Setting rfkill state requires authentication"
tags:
  - "Linux"
  - "manjaro"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "After a reboot I found I was being presented with an authentication dialog after login stating: setting rfkill state requires authentication It turns out t"
---
After a reboot I found I was being presented with an authentication dialog after login stating:

> setting rfkill state requires authentication

It turns out this is to do with blueman.

It's a strange issue because it doesn't affect my home system. Then I realised that in the office I'm using pam ldap to authenticate and it looks like I'm not triggering the unlock of the keyring to allow this to happen like at home.

To fix it I added my user into the wheel group and then created a policy that allows wheel to use the rfkill without authentication.

```
sudo gpasswd -a myuser wheel

sudo vi /etc/polkit-1/rules.d/51-blueman.rules


/* Allow users in wheel group to use blueman feature requiring root without authentication */
polkit.addRule(function(action, subject) {
    if ((action.id == "org.blueman.network.setup" ||
         action.id == "org.blueman.dhcp.client" ||
         action.id == "org.blueman.rfkill.setstate" ||
         action.id == "org.blueman.pppd.pppconnect") &&
        subject.isInGroup("wheel")) {

        return polkit.Result.YES;
    }
});
```

## References

[https://wiki.archlinux.org/index.php/Blueman#Permissions](https://wiki.archlinux.org/index.php/Blueman#Permissions)
