---
pubDatetime: 2017-08-10T08:35:05Z
modDatetime: 2017-08-10T12:37:57Z
title: "VCSA 6.0 U3b to 6.5 U1"
tags:
  - "Linux"
  - "vmware"
  - "Windows"
description: "So far this upgrade seems to frustrating straight out of the box! We already run a VCSA (vCenter Server Appliance) and the process should be to automatical"
---
So far this upgrade seems to frustrating straight out of the box! We already run a VCSA (vCenter Server Appliance) and the process should be to automatically deploy a new VCSA and migrate the data from the old to the new and then power down the old. All from the Windows GUI installer. But it fails to deploy with an unknown error. If you save and view the installer log it becomes abundantly clear what the failure is. The installer is trying to issue a 'date' command at the current VCSA's command line, and fails because it's expecting a BASH shell and instead it is getting the default vCenter shell where the BASH shell is disabled.

    2017-08-10T07:56:13.446Z - info: VM Identifier for Source VC: 78
    2017-08-10T07:56:13.570Z - debug: initiateFileTransferFromGuest error: ServerFaultCode: A general system error occurred: Unknown error
    2017-08-10T07:56:13.573Z - debug: Failed to get fileTransferInfo:ServerFaultCode: A general system error occurred: Unknown error
    2017-08-10T07:56:13.573Z - debug: Failed to get url of file in guest vm:ServerFaultCode: A general system error occurred: Unknown error
    2017-08-10T07:56:13.573Z - error: Error in getting fileData for nodeType. Error: ServerFaultCode: A general system error occurred: Unknown error
    2017-08-10T07:56:13.573Z - error: Failed to read the nodetype, Error: A general system error occurred: Unknown error
    2017-08-10T07:56:13.574Z - info: Checking if password expired
    2017-08-10T07:56:14.994Z - info: Banner from server, 
    VMware vCenter Server Appliance 6.0.0.30200

    Type: vCenter Server with an embedded Platform Services Controller


    2017-08-10T07:56:14.995Z - info: Connection ready
    2017-08-10T07:56:15.008Z - info: STDOUT: Last login: Thu Aug 10 07:55:37 UTC 2017 from pc8501.domain.local on pts/0

    2017-08-10T07:56:15.008Z - info: STDOUT: Last login: Thu Aug 10 07:56:15 2017 from pc8766.domain.local

    2017-08-10T07:56:15.010Z - info: STDOUT: date
    exit

    2017-08-10T07:56:15.246Z - info: STDOUT: Connected to service

    2017-08-10T07:56:15.255Z - info: STDOUT: [?1034h
        * List APIs: "help api list"
        * List Plugins: "help pi list"
        * Enable BASH access: "shell.set --enabled True"
        * Launch BASH: "shell"


    2017-08-10T07:56:15.255Z - info: STDOUT: Command> d
    2017-08-10T07:56:15.256Z - info: STDOUT: ate

    2017-08-10T07:56:15.270Z - info: STDOUT: Unknown command: `date'
    Command> exit

    2017-08-10T07:56:15.305Z - info: Stream :: close
    2017-08-10T07:56:15.306Z - info: Password not expired
    2017-08-10T07:56:15.308Z - error: sourcePrecheck: error in getting source Info: ServerFaultCode: A general system error occurred: Unknown error

In order to address the issue you need to change the default shell for the root user. It's very easy to do, but will also require a password change. Logon to the current VCSA using ssh as the root user. Enable the BASH shell and start the shell using:

    shell.set --enabled True
    shell

Now change the root users default shell using

    # chsh -s /bin/bash root

Now the installer should at least proceed through that part to deploy the image to the specified server. References: [https://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=2100508](https://kb.vmware.com/selfservice/microsites/search.do?language=en_US&cmd=displayKC&externalId=2100508)
