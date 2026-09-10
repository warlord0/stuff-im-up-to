---
pubDatetime: 2024-11-27T09:14:29Z
modDatetime: 2024-11-27T09:15:16Z
title: "Running Amazon Linux 2023 Locally"
tags:
  - "al2023"
  - "amazon"
  - "aws"
  - "cloud"
  - "devops"
  - "ec2"
  - "Linux"
heroImage: "/blog-media/2024/03/aws_logo.png"
description: "We have an AWS estate of EC2's and many other components. Whilst doing some testing, I was frustrated at the low-end specification of a server I wanted to build - I didn't want to invest in more cash than necessary. \"Can I run Amazon Linux 2023 on my own virtual machine?\""
---
> > We have an AWS estate of EC2's and many other components. Whilst doing some testing, I was frustrated at the low-end specification of a server I wanted to build - I didn't want to invest in more cash than necessary. *"Can I run Amazon Linux 2023 on my own virtual machine?"*

You can download Amazon Linux 2023 (AL2023) as a virtual disk and run it from your system. The only issue here is that unless you know the username and password to access it, you’re not getting very far.

[Index of /os-images/2023.6.20241121.0](https://cdn.amazonlinux.com/al2023/os-images/2023.6.20241121.0/)

I downloaded a `qcow2` image to run with `libvirt`. When I started it up, it takes me straight to a login prompt. But I have no credentials. The proper way to do this seems to be to use `cloud-init` to use a seed ISO file for the required user data.

[Complete Guide: Running Amazon Linux 2023 on VMware — Configuration and Setup Instructions](https://aws.plainenglish.io/complete-guide-running-amazon-linux-2023-on-vmware-configuration-and-setup-instructions-37c9577990cc)

- The link details how to do it with VMware, but it's a similar process for `cloud-init` that can be applied on other platforms.

Instead, I went looking for a program called `virt-rescue` this led me to `guestfish`. Guest fish can mount a `qcow2` file interactively. Then all I had to do was paste my SSH public key into `/home/ec2-user/authorized_keys`. Now when I start the virtual machine I can SSH in as the `ec2-user`, and it has full `sudo` capabilities to let me do anything.

`sudo guestfish --rw -a al2023.qcow2 -i`

[guestfish](https://libguestfs.org/guestfish.1.html)
