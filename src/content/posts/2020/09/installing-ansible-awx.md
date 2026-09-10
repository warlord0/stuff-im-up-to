---
pubDatetime: 2020-09-14T09:57:31Z
modDatetime: 2020-09-14T13:16:32Z
title: "Installing Ansible AWX"
tags:
  - "ansible"
  - "Docker"
  - "Linux"
heroImage: "/blog-media/2020/02/ansible800.png"
description: "Starting to look at a nice front end for Ansible and found a few quirks with the process that need to be taken care of. The actual installation of AWX need"
---
Starting to look at a nice front end for Ansible and found a few quirks with the process that need to be taken care of.

The actual installation of AWX needs Ansible installing on the system you're installing from. As I'm installing from localhost to localhost this means I need Ansible installed locally. Sounds obvious, but it's not in the prerequisites. You need to install, docker, docker-compose, the docker-compose python module AND ansible.

What's more is that you must use ansible \>= v2.8. By using the ansible from the default Debian repo you only get v2.7. This does not have the `docker_compose` module (back then it was still called `docker_service`). This will cause the install to fail with the following almost meaningless error:

```
$ ansible-playbook -i inventory install.yml
ERROR! no action detected in task. This often indicates a misspelled module name, or incorrect module path.

The error appears to have been in '/srv/container-deployments/awx/installer/roles/local_docker/tasks/compose.yml': line 39, column 7, but may
be elsewhere in the file depending on the exact syntax problem.

The offending line appears to be:

- block:
    - name: Start the containers
      ^ here
```

Install a newer ansible on Debian using the Ubuntu repository by creating `/etc/apt/sources.list.d/ansible.list`.

```
deb http://ppa.launchpad.net/ansible/ansible/ubuntu bionic main
```

Then use apt to install it.

```
sudo apt-key adv --keyserver keyserver.ubuntu.com --recv-keys 93C4A3FD7BB9C367
sudo apt update
sudo apt install ansible
```

Install the python modules for docker:

```
sudo pip3 install docker docker-compose
```

Edit the `inventory` file and make changes that reflect your installation. Tell it where to put your postgres data and where to create the `docker-compose.yml`, etc. (see [INSTALL.md](https://github.com/ansible/awx/blob/devel/INSTALL.md#inventory-variables))

Now run the install process.

```
ansible-playbook -i inventory install.yml
```

At the point where it starts the container set, be prepared for a bit of a wait as it does take some time. Then when you visit the actual web interface a http://localhost you'll probably be in for another wait as it carries out updates before you are able to logon.
