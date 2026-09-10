---
pubDatetime: 2024-07-30T10:35:05Z
title: "Passwordless run0"
tags:
  - "Linux"
  - "sudo"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "Using sudo without a password is essential for Ansible, and also helpful for frequent sysadmin tasks. To achieve the same in run0 you need to create a polk"
---
Using `sudo` without a password is essential for Ansible, and also helpful for frequent sysadmin tasks. To achieve the same in `run0` you need to create a `polkit` rule.

#### /etc/polkit-1/rules.d/10-systemd-nopasswd.rules

```
polkit.addRule(function(action, subject) {
    if (action.id == "org.freedesktop.systemd1.manage-units") {
        if (subject.isInGroup("wheel")) {
            return polkit.Result.YES;
        }
    }
});
```

This allows members of the group `wheel` to be able to use `run0` without authentication.

The history of the `wheel` group predates the use of `sudo`, it's primarily used by the PAM module `pam_wheel`. This would check if the user attempting to use the `su` command was a member of the `wheel` group, and only allow `su` if they were AND know the `root` password.

[pam_wheel(8) - Linux man page](https://linux.die.net/man/8/pam_wheel)

In most modern distros, `sudo` is used above `su`. The group `wheel` often does not exist on newer systems.

## PAM

The PAM configuration file `/etc/pam.d/su` can enable checking of `wheel` membership by uncommenting the entry, as shown below.

```
#%PAM-1.0
auth            sufficient      pam_rootok.so
# Uncomment the following line to implicitly trust users in the "wheel" g
roup.
#auth           sufficient      pam_wheel.so trust use_uid
# Uncomment the following line to require a user to be in the "wheel" gro
up.
auth            required        pam_wheel.so use_uid
auth            required        pam_unix.so
account         required        pam_unix.so
session         required        pam_unix.so
password        include         system-auth
```

Here, the uncommented line means being a member of the group `wheel` is `required`.
