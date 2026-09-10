---
pubDatetime: 2024-08-21T08:43:30Z
title: "Vagrant Error after Updates"
tags:
  - "libvirt"
  - "Linux"
  - "vagrant"
  - "Virtualisation"
heroImage: "/blog-media/2021/01/manjaro_logo.png"
description: "After applying updates, I got an error trying to bring up a vagrant host. Error message given during initialization: Unable to resolve dependency: user req"
---
After applying updates, I got an error trying to bring up a vagrant host.

```
Error message given during initialization: Unable to resolve dependency: user requested 'vagrant-libvirt (= 0.12.2)'
```

I followed the instructions it gave and repaired, expunged and updated plugins.

```
vagrant plugin repair
vagrant plugin expunge --reinstall
vagrant plugin update
```

This resulted in a version conflict of `bigdecimal`.

```
conflicting dependencies bigdecimal (= 3.1.3) and bigdecimal (= 3.1.8)
  Activated bigdecimal-3.1.8
  which does not match conflicting dependency (= 3.1.3)
```

A bit of searching and I found there is a variable that will allow me to get the plugin installed.

```
VAGRANT_DISABLE_STRICT_DEPENDENCY_ENFORCEMENT=1 vagrant plugin install vagrant-libvirt
```

## References

[https://forum.manjaro.org/t/cant-use-vagrant-with-libvirt-wrong-gem-date-version/157814](https://forum.manjaro.org/t/cant-use-vagrant-with-libvirt-wrong-gem-date-version/157814)
