---
pubDatetime: 2024-04-02T18:48:00Z
modDatetime: 2024-04-02T15:58:18Z
title: "AWS: SSH using Systems Manager"
tags:
  - "aws"
  - "Linux"
  - "Security"
  - "ssh"
heroImage: "/blog-media/2024/03/aws_logo.png"
description: "Systems Manager Systems Manager adds a layer of management to your EC2’s. One particular benefit is being able to SSH into an EC2 without having to open a"
---
## Systems Manager

Systems Manager adds a layer of management to your EC2’s. One particular benefit is being able to SSH into an EC2 without having to open a port to the server. Giving an additional layer of security to the host.

It does this by connecting an Agent service from your EC2 to Systems Manager, and you are then able to proxy via a `aws-cli` `ssm` connection.

There are a number of Amazon Machine Images (AMI) that come with the `ssm` [agent preinstalled](https://docs.aws.amazon.com/systems-manager/latest/userguide/ami-preinstalled-agent.html) - Ubuntu 22.04 LTS server is one of them.

### Prerequisites

Make sure you have installed `aws-cli` v2 and the plugin for session-manager locally.

```
pamac install awc-cli-v2 aws-session-manager-plugin
```

Or use your package manager in the Linux distro you are using.

### Configuration

You must set up Systems Manager to be able to act in your region. If you go to Systems Manager \> Fleet Manager and if you’ve not been there before, you should see a dialogue to enable “Default Host Management Configuration”. Make sure you are in the region your EC2’s are in and enable it, choose the recommended IAM role.

After you’ve done this, be patient. It may take 30 mins for your EC2 to connect to SSM.

Monitor from inside the EC2 using:

```
$ sudo ssm-cli get-diagnostics
```

### Testing

You can test in the AWS Console by visiting your EC2 and trying “Connect” with “Connect using EC2 Instance Connect” - this should give you a browser based terminal session to your EC2.

Using `aws-cli` you can connect to the terminal using:

```
aws ssm start-session --target i-0f11d910c9f9af423
```

Where `i-0f11d910c9f9af423` is the unique instance ID to connect to.

### Using SSH

Connecting to a terminal is useful, but limiting. Using SSH enables us more flexibility in being able to `rsync` files and use all the SSH capabilities for tunnelling etc.

Create an ssh config with the following content:

```
# SSH over Session Manager 
host i-* mi-*
    User ubuntu    
    ProxyCommand sh -c "aws ssm start-session --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p'"
```

Now you can SSH directly to your instance ID, eg.

```
ssh i-0f11d910c9f9af423
```

You can `rsync` using:

```
$ rsync -Pavz myFile i-0f11d910c9f9af423:/tmp
sending incremental file list
myFile
          1,491 100%    0.00kB/s    0:00:00 (xfr#1, to-chk=0/1)

sent 396 bytes  received 35 bytes  172.40 bytes/sec
total size is 1,491  speedup is 3.46
```

## References

[Amazon Machine Images (AMIs) with SSM Agent preinstalled - AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/ami-preinstalled-agent.html)

[Step 1: Configure instance permissions for Systems Manager - AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/setup-instance-permissions.html)

[Step 8: (Optional) Allow and control permissions for SSH connections through Session Manager - AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-getting-started-enable-ssh-connections.html)
