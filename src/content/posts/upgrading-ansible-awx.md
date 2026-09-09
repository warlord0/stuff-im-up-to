---
pubDatetime: 2021-02-24T19:08:02Z
modDatetime: 2021-03-22T20:42:09Z
title: "Upgrading Ansible AWX"
tags:
  - "ansible"
  - "Docker"
  - "Linux"
  - "Virtualisation"
description: "What a frustrating exercise to get to do something so simple! I'm running Ansible AWX 14.1.0 as a local docker install. The installation did all the hard w"
---
**What a frustrating exercise to get to do something so simple!**

I'm running Ansible AWX 14.1.0 as a local docker install. The installation did all the hard work when I initially installed it. It build the `docker-compose.yml` for me from information I fed it in the `inventory` file. It's been running flawlessly, but it's about time I did an upgrade.

Wow! It wasn't that long ago I installed it and it's moved from v14 to v17 already. Better read up on the upgrade process. Wait a minute, where is the upgrade process? I can see how you install it. A bit of duck-jitsu and I'm finding github posts about the upgrade process being frustrating and going into loops and just edit the `docker-compose.yml` and change the version, do a `docker-compose pull` and re-up the container.

Ok, let's see what happens. Change the version do a pull. Yes that's seems to be starting - oh, wait it's in the upgrade loop wait 5s as in the issues. Let's back out of that and see if we can make more sense of how this works.

Looks like all I need to do is maintain my `inventory` file from the initial install, do a git pull and run the install playbook...

Ok, so it's a good job I keep crap stored without tidying up. I have the `inventory` file and the old installer. All I have to do is go into the folder and `git pull` to update it. Ok, git's telling me the `inventory` file has changed and I can't do a pull until I stash the change and start from a clean base. Done that now just run the installer - that ran fairly quickly and I see no changes in my docker project folder, and there are no new docker containers? It's not actually running an install.

Let's have a look at what it should be doing. It uses ansible to run a playbook for the install, there's an `installer/roles` folder, but that only has `kubernetes` in it, where's docker?

I start looking at github and the branches and notice there are tags for the different versions. The default `devel` branch doesn't have any docker role. So I must switch to the tag `17.0.1` and now I see `local_docker` as a role folder.

## TLDR;

> To upgrade Ansible AWX make sure you kept your original `installer/inventory` file. If you didn't I hope at least you recorded the content.

#### installer/inventory (comments stripped)

```
localhost ansible_connection=local ansible_python_interpreter="/usr/bin/env python3"
[all:vars]
dockerhub_base=ansible
awx_task_hostname=awx
awx_web_hostname=awxweb
postgres_data_dir="/srv/container-volumes/awx/postgres"
host_port=35080
host_port_ssl=35043
docker_compose_dir="/srv/container-deployments/awx"
pg_username=awx
pg_password=awxpass
pg_database=awx
pg_port=5432
admin_user=admin
admin_password=password
create_preload_data=True
secret_key=awxsecret
```

Because we kept our file we can clone the awx repository and just edit or replace the `installer/inventory` file with ours.

```
cd ~
git clone https://github.com/ansible/awx.git
cd awx/installer
git checkout tags/17.0.1
vi inventory
```

> **NOTE:** Notice the change to the tag of the version we want to install. This was key to the upgrade process.

Now we must stop the existing AWX containers. I left the postgresql DB up and running:

```
cd /srv/container-deployments/awx
docker-compose stop redis task web 
```

I can then start the installer (there is no upgrade process, it figures it out by itself).

```
cd ~/awx/installer
ansible-playbook -i inventory install.yml
```

Ignoring the skipped kubenetes tasks and just looking at the docker related output this is how it looks:

```
TASK [local_docker : Generate broadcast websocket secret] *********************************************************************************************************************************************************
ok: [localhost]

TASK [local_docker : Get full path of postgres data dir] **********************************************************************************************************************************************************
changed: [localhost]

TASK [local_docker : Register temporary docker container] *********************************************************************************************************************************************************
ok: [localhost]

TASK [local_docker : Check for existing Postgres data (run from inside the container for access to file)] *********************************************************************************************************
changed: [localhost]

TASK [local_docker : Record Postgres version] *********************************************************************************************************************************************************************
changed: [localhost]

TASK [local_docker : Determine whether to upgrade postgres] *******************************************************************************************************************************************************
ok: [localhost]

TASK [local_docker : Set up new postgres paths pre-upgrade] *******************************************************************************************************************************************************
changed: [localhost]

TASK [local_docker : Stop AWX before upgrading postgres] **********************************************************************************************************************************************************
changed: [localhost]

TASK [local_docker : Upgrade Postgres] ****************************************************************************************************************************************************************************
changed: [localhost]

TASK [local_docker : Copy old pg_hba.conf] ************************************************************************************************************************************************************************
changed: [localhost]

TASK [local_docker : Remove old data directory] *******************************************************************************************************************************************************************
changed: [localhost]

TASK [local_docker : Export Docker awx image if it isnt local and there isnt a registry defined] ******************************************************************************************************************
skipping: [localhost]

TASK [local_docker : Set docker base path] ************************************************************************************************************************************************************************
skipping: [localhost]

TASK [local_docker : Ensure directory exists] *********************************************************************************************************************************************************************
skipping: [localhost]

TASK [local_docker : Copy awx image to docker execution] **********************************************************************************************************************************************************
skipping: [localhost]

TASK [local_docker : Load awx image] ******************************************************************************************************************************************************************************
skipping: [localhost]

TASK [local_docker : Set full image path for local install] *******************************************************************************************************************************************************
skipping: [localhost]

TASK [local_docker : Set DockerHub Image Paths] *******************************************************************************************************************************************************************
ok: [localhost]

TASK [local_docker : Create /srv/container-deployments/S00350 directory] ******************************************************************************************************************************************
ok: [localhost]

TASK [local_docker : Create Redis socket directory] ***************************************************************************************************************************************************************
changed: [localhost]

TASK [local_docker : Create Docker Compose Configuration] *********************************************************************************************************************************************************
changed: [localhost] => (item={u'mode': u'0600', u'file': u'environment.sh'})
changed: [localhost] => (item={u'mode': u'0600', u'file': u'credentials.py'})
changed: [localhost] => (item={u'mode': u'0600', u'file': u'docker-compose.yml'})
changed: [localhost] => (item={u'mode': u'0600', u'file': u'nginx.conf'})
ok: [localhost] => (item={u'mode': u'0664', u'file': u'redis.conf'})

TASK [local_docker : Render SECRET_KEY file] **********************************************************************************************************************************************************************
changed: [localhost]

TASK [local_docker : Remove AWX containers before migrating postgres so that the old postgres container does not get used] ****************************************************************************************
changed: [localhost]

TASK [local_docker : Run migrations in task container] ************************************************************************************************************************************************************
changed: [localhost]

TASK [local_docker : Start the containers] ************************************************************************************************************************************************************************
changed: [localhost]

TASK [local_docker : Update CA trust in awx_web container] ********************************************************************************************************************************************************
changed: [localhost]

TASK [local_docker : Update CA trust in awx_task container] *******************************************************************************************************************************************************
changed: [localhost]

TASK [local_docker : Wait for launch script to create user] *******************************************************************************************************************************************************
ok: [localhost]

TASK [local_docker : Create Preload data] *************************************************************************************************************************************************************************
ok: [localhost]

PLAY RECAP ********************************************************************************************************************************************************************************************************
localhost                  : ok=27   changed=16   unreachable=0    failed=0    skipped=66   rescued=0    ignored=0
```

It clearly found my postgres data:

```
TASK [local_docker : Check for existing Postgres data (run from inside the container for access to file)]
```

Then proceeded to upgrade everything.

Considering the answer was such a simple process it took me a long while to get there.

## References

[Installing Ansible AWX](https://warlord0blog.wordpress.com/2020/09/14/installing-ansible-awx/)

[https://github.com/ansible/awx](https://github.com/ansible/awx)
