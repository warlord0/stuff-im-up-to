---
pubDatetime: 2023-12-07T18:30:42Z
modDatetime: 2023-12-07T18:31:52Z
title: "Vagrant and Ansible"
tags:
  - "Linux"
  - "vagrant"
  - "Virtualisation"
  - "Windows"
heroImage: "/blog-media/2023/12/vagrant.png"
description: "Using Vagrant you can automatically deploy a Virtual Machine on almost any virtual platform, VMware, Virtual Box, and QEMU/KVM (libvirt). It works similarl"
---
Using Vagrant you can automatically deploy a Virtual Machine on almost any virtual platform, VMware, Virtual Box, and QEMU/KVM (libvirt).

It works similarly to Docker. It has a repository, [Vagrant Cloud](https://app.vagrantup.com/boxes/search), that is similar to Docker hub. You specify a base image to use from the cloud, and it deploys it to your platform (provider). You can configure how it is delivered using a config file called ‘Vagrantfile’.

Within ‘Vagrantfile’ you can also specify a tool to use to further “provision” the virtual machine. You can use a variety from Puppet, shell, and Ansible.

## Libvirt plugin

Install the plugin using:

```
$ vagrant plugin install vagrant-libvirt
```

## Vagrantfile

```
# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure("2") do |config|
  config.vm.define :myserver do |server|
    server.vm.box = "debian/bookworm64"
    server.vm.synced_folder ".", "/vagrant", disabled: true
    server.vm.hostname = "myserver"
    server.vm.provider :libvirt do |libvirt|
      libvirt.title = "Vagrant Machine Build"
      libvirt.description = "Debian 12 Bookworm (Vagrant)"
      libvirt.memory = 2048
      libvirt.cpus = 2
      libvirt.keymap = "en-gb"
      libvirt.autostart = true
      libvirt.storage :file, :size => "20GB", name: "data"
    end
    server.vm.provision :ansible do |ansible|
      ansible.playbook = "playbook.yml"
      ansible.compatibility_mode = "2.0"
    end
  end
end
```

Here we are building a Debian 12 (bookworm) machine with 2048 MB RAM, and 2 vCPU's. Then we are using an Ansible play book to complete the provisioning. We also add a second disk as a 20GB data volume - it will require formatting and mounting, all of which could be done from Ansible.

## Image Files

The "box" (debian/bookworm64) is pulled from the cloud repository, and stored as a cached copy in your specified, or default pool in libvirt. It is then used as a base image to take a snapshot from, to clone to the machines that are based on the same box image.

## References

[Vagrant Libvirt Documentation](https://vagrant-libvirt.github.io/vagrant-libvirt/configuration.html)

[Vagrant Boxes Create Virtual Machines in Seconds on VirtualBox, Hyper-V, and VMware](https://www.virtualizationhowto.com/2023/12/vagrant-boxes-create-virtual-machines-in-seconds-on-virtualbox-hyper-v-and-vmware)
