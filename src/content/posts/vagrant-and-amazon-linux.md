---
pubDatetime: 2024-12-18T11:14:30Z
title: "Vagrant and Amazon Linux"
draft: true
tags:
  - "Uncategorized"
description: "Following on from Running Amazon Linux 2023 Locally, I needed to progress to having a cloud-init that would allow vagrant to start the image properly, create the vagrant user, give it the insecure key, etc."
---
Following on from [Running Amazon Linux 2023 Locally](https://warlord0blog.wordpress.com/2024/11/27/running-amazon-linux-2023-locally/), I needed to progress to having a `cloud-init` that would allow vagrant to start the image properly, create the vagrant user, give it the insecure key, etc.

This is the bare-bones of the `cloud-init.yml` that is required to be able to have vagrant complete the set-up. Using this method does not require any modification of the Amazon Linux image.

### cloud-init.yml

```
#cloud-config

users:
  - default
  - name: vagrant
    sudo: ALL=(ALL) NOPASSWD:ALL
    shell: /bin/bash
    passwd: vagrant
    ssh_authorized_keys:
      - ssh-rsa AAAAB3NzaC1yc2EAAAABIwAAAQEA6NF8iallvQVp22WDkTkyrtvp9eWW6A8YVr+kz4TjGYe7gHzIw+niNltGEFHzD8+v1I2YJ6oXevct1YeS0o9HZyN1Q9qgCgzUFtdOKLv6IedplqoPkcmF0aYet2PkEDo3MlTBckFXPITAMzF8dJSIFo9D8HfdOV0IAdx4O7PtixWKn5y2hMNG0zQPyUecp4pzC6kivAIhyfHilFR61RGL+GPXQ2MWZWFYbAGjyiYJnAmCP3NOTd0jMZEnDkbUvxhMmBYSdETk1rRgm+R4LOzFUGaHqHDLKLX+FIPKcF96hrucXzcWyLbIbEgE98OHlnVYCzRdK8jlqm8tehUc9c9WhQ== vagrant insecure public key

ssh_pwauth: true
chpasswd:
  expire: false

write_files:
  - path: /etc/sudoers.d/vagrant
    content: |
      vagrant ALL=(ALL) NOPASSWD:ALL
    permissions: "0440"
```

Use `cloud-localds` to create the required ISO file.

```
cloud-localds cloud-init.iso cloud-init.yml
```

### Vagrantfile

This is an example of the `Vagrantfile` that builds the VM's for me. Notice the full path to the `cloud-init.iso`.

```
# -*- mode: ruby -*-
# vi: set ft=ruby :

servers = [
  { :hostname => "etcd-0" },
  { :hostname => "etcd-1" },
  { :hostname => "etcd-2" },
]

Vagrant.configure("2") do |config|
  servers.each do |conf|
    # Specify your cloud-init file
    # config.vm.cloud_init :user_data, path: "cloud-init.yml"    
    config.vm.define conf[:hostname] do |server|
      server.vm.box = "al2023-kvm-2023.6.20241121.0-kernel-6.1-x86_64.xfs.gpt"
      server.vm.synced_folder "./", "/vagrant", disabled: false, nfs_udp: false
      server.vm.hostname = conf[:hostname]

      server.vm.provider :libvirt do |libvirt|
        libvirt.title = conf[:hostname]
        libvirt.description = "Amazon Linux (Vagrant)"
        libvirt.memory = 2048
        libvirt.cpus = 2
        libvirt.keymap = "en-gb"
        libvirt.autostart = true
        # Attach the cloud-init ISO
        libvirt.storage :file, :device => :cdrom, 
                              :path => '/home/user/vagrant/al2023-etcd/cloud-init.iso',
                              :bus => 'sata'      
      end
#      server.vm.provision :ansible do |ansible|
#        ansible.playbook = "playbook.yml"
#        ansible.compatibility_mode = "2.0"
#      end
    end
  end
end
```

Then you just bring up the VM with `vagrant up` and in the output you should see it successfully start, ready for you to `vagrant ssh` into.

```
...
==> etcd-0: Waiting for domain to get an IP address...
==> etcd-0: Waiting for machine to boot. This may take a few minutes...
    etcd-0: SSH address: 192.168.121.97:22
    etcd-0: SSH username: vagrant
    etcd-0: SSH auth method: private key
    etcd-0: Warning: Connection refused. Retrying...
    etcd-0: 
    etcd-0: Vagrant insecure key detected. Vagrant will automatically replace
    etcd-0: this with a newly generated keypair for better security.
    etcd-0: 
    etcd-0: Inserting generated public key within guest...
    etcd-0: Removing insecure key from the guest if it's present...
    etcd-0: Key inserted! Disconnecting and reconnecting using new SSH key...
==> etcd-0: Machine booted and ready!
==> etcd-0: Setting hostname...
==> etcd-0: Exporting NFS shared folders...
==> etcd-0: Preparing to edit /etc/exports. Administrator privileges will be required...
==> etcd-0: Mounting NFS shared folders...
    etcd-0: /home/user/vagrant/al2023-etcd => /vagrant
```
