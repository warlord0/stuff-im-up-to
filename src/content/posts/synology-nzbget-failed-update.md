---
pubDatetime: 2022-01-12T21:31:26Z
modDatetime: 2022-01-12T21:33:06Z
title: "Synology Nzbget Failed Update"
tags:
  - "Linux"
  - "nzbget"
  - "Privateer"
  - "synology"
description: "Package manager said I needed some updates, including nzbget. Usually this is pretty straight forward, but this time it just fails and goes into a state wh"
---
Package manager said I needed some updates, including nzbget. Usually this is pretty straight forward, but this time it just fails and goes into a state where your only option is to "Repair". The repair also fails so what now?

Logon to the Synology CLI using ssh and take a copy of `/volume1/@appstore/nzbget/var/nzbget.conf`, eg.

```
sudo cp /volume1/@appstore/nzbget/var/nzbget.conf ~/
```

Then in package manager under community packages, find nzbget and use the drop down menu from the button to uninstall it.

Once uninstalled, you can then carry out a fresh installation. It doesn't really matter what you answer to the installation questions, but it may start but complain about permission. Don't panic, just shut it down using stop, in the package manager.

Now we copy the backup `nzbget.conf` file back using:

```
sudo cp ~/nzbget.conf /volume1/@appstore/nzbget/var/nzbget.conf
```

When you then restart nzbget in the package manager using "Run" it should come back as if nothing was wrong with it.

## References

https://www.reddit.com/r/synology/comments/rv7hgf/nzbget_wont_install_and_cannot_be_repaired_after/
