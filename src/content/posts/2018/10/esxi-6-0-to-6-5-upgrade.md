---
pubDatetime: 2018-10-14T13:18:35Z
modDatetime: 2018-10-22T17:13:40Z
title: "ESXi 6.0 to 6.5 Upgrade"
tags:
  - "Linux"
  - "vmware"
heroImage: "/blog-media/2016/10/vmware-logo-eps-vector-image-800x533-e1476948729563.png"
description: "This weekend has turned out to be a challenge. Upgrading our VMware Horizon 7 estate to the latest release involved upgrading all the components from conne"
---
This weekend has turned out to be a challenge. Upgrading our VMware Horizon 7 estate to the latest release involved upgrading all the components from connection servers, security server, composer, vCenter and vSphere hosts. Last weekend was upgrading the connection servers, security server and composer. This weekend is vCenter and the vSphere hosts.

> 99.9% of the skills required are really about how strong your Google Fu is! ![hongkongphoeey](/blog-media/2018/10/hongkongphoeey.png)

My skills include Google-fu and Duck-Jitsu, but I'm a Bing-do novice!

## vCenter

Upgrading vCenter yesterday should have been a case of carrying out the side by side install and data migration upgrade. Sadly we got an error during the migration process where stage 2 complained that it was unable to collect data from the old 6.0 vCenter server. Some Googling later it lead us to think it was to do with the EAM service not running. So more Googling and I came across an article about the *`/etc/vmware-eam/e`*`am.properties` file being empty. Sure enough ours was empty.

### So how do I recreate eam.properties?

In the same folder we had an `eam.properties.rpmnew` file. But this was pretty much a template file with lots of `##{}##` markers in it that should probably have data about our server. But what values do I need? This is where the following post reply was invaluable. I was able to find the settings from the article and replace the bits matching my server. [https://communities.vmware.com/message/2743610#2743610](https://communities.vmware.com/message/2743610#2743610) There is ONE exception. Don't change the line

    vc.tunnelSdkUri.template=https://##{VC_HOST_NAME}##:8089/sdk/vimService

Then I restarted the vmware-eam service with:

    # service vmware-eam start

I still saw lots of Java errors in the `/var/log/vmware/eam/eam.log` file, but things were working so let's move on. Then it was back to the upgrade process again and this time it completed successfully!

## vSphere

Of the five servers we have it started out badly on three of them, and got worst on the last two! The upgrade process stopped with a warning about outdated vib files that should be removed or new ones injected into the ISO image using VMware Image Builder. That's great, but we don't have Image Builder setup. We resorted to removing the vibs from the running 6.0 server. Drop it into maintenance mode, ssh onto the console and then remove the offending vibs. In our case these were Brocade network drivers and the Teradici PCoIP driver.

    # esxcli software vib list | grep -i brocade
    # esxcli software vib list | grep -i teradici

Then remove the listed vibs using the short name shown in the listing:

    # esxcli software vib remove -n tera2
    # esxcli software vib remove -n pcoip-ctrl
    # esxcli software vib remove -n net-bna
    # esxcli software vib remove -n scsi-bfa

Each one of these takes an age to process during which time NOTHING happens. So don't panic, leave it doing what it does until it returns with a success message. Finally reboot onto the installation/upgrade media and now the upgrade process completes and we have three functional ESXi vSphere 6.5 servers! Then we came across server number four and five. These appear to have been setup differently. Same 6.0 version, just slight config differences. But doing a listing of vibs, expecting to carry out the same removal process showed only one vib installed on server number four - it only listed a single vib - light-tools and not what we expected. Looking on server five we had some of the vibs we expected - the Teradici was there at least. Trying to upgrade number four failed at 19% with an error:

> AttributeError: ‚NoneType‘ object has no attribute ‚AddVibs‘

Selecting back in the upgrade process then only allowed us a full re-install and overwrite of our config. We stopped it there and rebooted back to v6.0. More Google Fu and the first thing I found was [https://communities.vmware.com/thread/487341](https://communities.vmware.com/thread/487341) which is unresolved. The following gave me what I wanted to see, but wasn't exactly what we experienced: [https://www.vcloudnine.de/vmware-update-manager-reports-error-code-99-during-scan-operation/](https://www.vcloudnine.de/vmware-update-manager-reports-error-code-99-during-scan-operation/) The simple explanation was to copy the `/var/db/esximg/` and sub-folders from the remaining number \#5 server to number \#4 (because it is the same version). I could then get a listing of the installed vibs, but trying to remove the `tera2` vib resulted in a huge list of missing vibs to be displayed! The final nail in the coffin for this issue was found here: [https://www.provirtualzone.com/esxi-6-0-fix-corrupted-host-imageprofile/](https://www.provirtualzone.com/esxi-6-0-fix-corrupted-host-imageprofile/) Looking at the \#4 `imgdb.tgz` file it was only 500b, much different from the \#5 server. I then used scp and copied the `/bootbank/imgdb.tgz` from \#5 to \#4 and rebooted. After the reboot I could then remove the `tera2` and `pcoip-ctrl` vibs and reboot onto the install/upgrade media. Now we're at the point where \#4 and \#5 have successfully upgraded to vSphere 6.5! Just needed to complete the upgrade process of reinstalling the Teradici vib, upgrading the agents and drivers in the guest images.
