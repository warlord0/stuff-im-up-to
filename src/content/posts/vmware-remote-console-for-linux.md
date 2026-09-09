---
pubDatetime: 2017-11-22T14:33:06Z
modDatetime: 2017-11-22T15:25:16Z
title: "VMware Remote Console for Linux"
tags:
  - "Linux"
  - "vmware"
description: "This has frustrated me for as long as I can remember. How do I manage our VMware vSphere estate when the tools provided don't work reliably on Linux? First"
---
This has frustrated me for as long as I can remember. How do I manage our VMware vSphere estate when the tools provided don't work reliably on Linux? First there was the vCenter problem using Flash Player. Thank fully they release v6.5 which has a new HTML5 based interface - no more Flash Player!

> [https://vcsa/ui](https://vcsa/ui)

Then inside there you could download the VMware Remote Console (VMRC) and isntall that to allow you to remote onto the actual vSphere guest and not rely on other Guest remote tools like RDS or VNC. Only trouble with VMRC is that it would not install on my Debian system. I upgraded to the Debian Buster/Sid (testing) version and still can't get it to work. Then I couldn't uninstall it either! The uninstall complains that there is an `unmet dependency for vmware-usbabitrator<=17.1.1`. Try as I might I couldn't get that to install either. I ran the installer bundle with a `-x [path]` to extract it then manually tried to get the `vmware-usbarbitrator` to run. **Then gave up**. Time to resort to using VMware Workstation Player! Yes, the player can open `vmrc://` links. But I couldn't get it to install because it too complained about `vmware-usbarbitrator`. So I had to revisit removing VMRC. To get the removal to work I used [DB Explorer for SQLite](http://sqlitebrowser.org/) and opened the `/etc/vmware-installer/database` file. Then deleted the row from the table `component_dependencies` that contained `vmware-usbarbitrator>=17.1.1` ![Selection_005](/blog-media/2017/11/selection_0051.png) Then I could remove VMRC using:

    $ sudo vmware-installer -u vmware-vmrc

This did the trick and it got rid of VMRC. A `vmware-installer -l` still showed VIX so I removed that too.

    $ sudo vmware-installer -u vmware-vix

Now my WMware Workstation Player bundle installed successfully. So I ran it from the menu. I left the license empty at this point and continued to accept the dialogs required to get to the main VMware Player app. Now it's just a case of going back to my vCenter Server Appliance ([https://vcsa/ui](https://vcsa/ui)) management interface and clicking on a Guests "Launch Remote Console" link. It fires up VMware Player and asks for credentials for the vcsa and up pops the guest remote screen!
