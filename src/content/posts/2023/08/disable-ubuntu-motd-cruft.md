---
pubDatetime: 2023-08-18T07:38:09Z
title: "Disable Ubuntu motd Cruft"
tags:
  - "Linux"
  - "ubuntu"
heroImage: "/blog-media/2020/02/ubuntu_logo.png"
description: "Canonical insist on advertising in their motd news as you log on. You get told you're not part of ESM and click here to sign up - get rid of it all using t"
---
Canonical insist on advertising in their `motd` news as you log on. You get told you're not part of ESM and click here to sign up - get rid of it all using the guidance from here:

[https://askubuntu.com/a/1456185](https://askubuntu.com/a/1456185)

Edit `/usr/lib/update-notifier/apt_check.py`

Change each of the following function definitions, so it returns without doing anything, by inserting a first line to `return`:

```
def _output_esm_package_count(outstream, service_type, esm_pkg_count):
    " output the number of packages upgrades related to esm service "
    return

def _output_esm_package_alert(
    outstream, service_type, disabled_pkg_count, is_esm=False
):
    " output the number of upgradable packages if esm service was enabled "
    return

def _output_esm_service_status(outstream, have_esm_service, service_type):
    return
```
