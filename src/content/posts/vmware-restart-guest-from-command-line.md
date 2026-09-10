---
pubDatetime: 2017-08-16T12:05:41Z
modDatetime: 2017-08-16T12:11:31Z
title: "VMWare Restart Guest from Command Line"
tags:
  - "Linux"
  - "vmware"
heroImage: "/blog-media/2016/10/vmware-logo-eps-vector-image-800x533-e1476948729563.png"
description: "We don't have to do this so often. So when we do I always forget the syntax. Login as root on the host of the guest OS. Find the numeric VMID of the guest"
---
We don't have to do this so often. So when we do I always forget the syntax. Login as root on the host of the guest OS. Find the numeric VMID of the guest and issue a power off/on command.

    # vim-cmd vmsvc/getallvms | grep -i "[GUESTNAME]"
    Vmid                   Name                                                             File                                                   Guest OS          Version                                                                                                      Annotation                                                                                                   
    114    PaymentsTest                            [Datastore-1] PaymentsTest/PaymentsTest.vmx                                               windows8Server64Guest   vmx-10

    # vim-cmd vmsvc/power.getstate 114
    Retrieved runtime info
    Powered on

    # vim-cmd vmsvc/power.off 114
    Powering off VM:

    # vim-cmd vmsvc/power.getstate 114
    Retrieved runtime info
    Powered off

    # vim-cmd vmsvc/power.on 114
    Powering on VM:

  References: [https://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=1038043](https://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=1038043)
