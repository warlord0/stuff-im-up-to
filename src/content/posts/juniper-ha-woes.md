---
pubDatetime: 2017-07-06T16:38:07Z
title: "Juniper HA Woes"
tags:
  - "Networking"
  - "Security"
description: "I spent quite some time messing around with a pair of Juniper SRX320's trying to get the HA clustering setup. The documentation seems pretty straight forwa"
---
I spent quite some time messing around with a pair of Juniper SRX320's trying to get the HA clustering setup. The documentation seems pretty straight forward, but I kept tripping over one fatal flaw. Initially I configured HA using the J-Web interface and it configured successfully. I made some changes, set things up to test and then decided I didn't like the direction I was taking and wanted to factory reset the devices. The reset seemed pretty straight forward but then everything went wrong when I tried to follow the Command Line instructions for setting up an Active/Passive configuration. Every time I put the two systems into cluster mode and set the cluster ID and node the secondary node (node 1) always showed as lost and disabled. This means you can't continue with any configuration as you cannot successfully `commit` the changes as it cannot write to the other node. If you look at the cluster status it shows that it is unable to assign the address to the either of the nodes. Even resetting both back to factory settings and giving them different node numbers just moved the problem between devices. I even had a Juniper engineer bashing his head on the desk until we discovered that to make the cluster config operational we first must set the non-cluster mode `admin` password! Setting the cluster mode admin password is not good enough, you must establish a minimum committed config on the non-cluster configuration - which means you **must** have an `admin` password. It's as simple as that! Once the non-cluster config has an admin password you can enable clustering and continue the configuration process. On node 0

    % cli
    user@host> set system root-authentication plain-text-password
    user@host> set chassis cluster cluster-id 1 node 0 reboot

And on node 1

    % cli
    user@host> set system root-authentication plain-text-password
    user@host> set chassis cluster cluster-id 1 node 1 reboot

Without that root-authentication password the nodes just wouldn't talk to each other. Now just continue with the Active/Passive config as per the [Security Chassis Cluster Guide](https://www.juniper.net/documentation/en_US/junos/information-products/pathway-pages/security/security-chassis-cluster.html). References: [https://www.juniper.net/documentation/en_US/junos/information-products/pathway-pages/security/security-chassis-cluster.pdf](https://www.juniper.net/documentation/en_US/junos/information-products/pathway-pages/security/security-chassis-cluster.pdf)
