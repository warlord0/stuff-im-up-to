---
pubDatetime: 2019-07-25T12:34:09Z
modDatetime: 2019-07-27T16:43:48Z
title: "Gitlab: When an Upgrade Goes Bad!"
tags:
  - "git"
  - "Linux"
heroImage: "/blog-media/2019/07/gitlab-1.png"
description: "Today is not a lot of fun. I've been seeing some issues with apt not being able to upgrade Gitlab due to a proxy error. This morning I fixed it and the upg"
---
Today is not a lot of fun.

I've been seeing some issues with `apt` not being able to upgrade Gitlab due to a proxy error. This morning I fixed it and the upgrade from 11.11.2 to 12.1.1 began - and failed miserably!

It complained with all kinds of problems not being able to carry out migrations:

```
Exception: Your database is missing the 'cache_invalidation_event_id' column from the 'geo_event_log' table that is present for GitLab EE.
 Even though it looks like you're running a CE installation, it appears
 you may have installed GitLab EE at some point. To migrate to GitLab 12.0:
 Install GitLab 11.11.3 EE
 Install GitLab 12.0.x CE 
```

This was just the start of my problems.

> You could continue reading, but the end result is that I needed to read what the error message above suggested. Install EE AND then install CE. I took the long way around to get there.

I tried following some guidance about dropping tables using the dbconsole, but I just seemed to be going down deeper into the rabbit hole.

```
$ sudo gitlab-rails dbconsole
```

I checked I had backups:

```
$ ls -lh /var/opt/gitlab/backups/
total 367M
-rw------- 1 git git 270K Sep  3  2018 1535972468_2018_09_03_11.0.4_gitlab_backup.tar
 -rw------- 1 git git 720K Feb 19 11:01 1550574061_2019_02_19_11.2.3_gitlab_backup.tar
 -rw------- 1 git git 1.2M May  2 09:24 1556785455_2019_05_02_11.7.5_gitlab_backup.tar
 -rw------- 1 git git 1.3M Jun  5 09:05 1559721901_2019_06_05_11.10.4_gitlab_backup.tar
 -rw------- 1 git git 1.3M Jun  5 15:37 1559745479_2019_06_05_11.11.1_gitlab_backup.tar
 -rw------- 1 git git 4.0M Jul 25 10:21 1564046471_2019_07_25_11.11.2_gitlab_backup.tar
 -rw------- 1 git git 357M Jul 25 11:13 1564049595_2019_07_25_12.1.1_gitlab_backup.tar
 -rw-r--r-- 1 git git  247 Jul 25 10:21 backup_information.yml
 drwxr-xr-x 2 git git 4.0K Jul 25 10:21 db
```

Thankfully I do.

But now I have to rollback my gitlab-ce installation to version 11.11.2. This took me some figuring out as the gitlab restore fails because my install is newer than the data I'm trying to restore.

Because I have a `apt` install I can use version pinning to get back to a working version.

I created a file `/etc/apt/preferences.d/gitlab` and put in the following:

```
Package: gitlab-ce
Pin: version 11.11.2*
Pin-Priority: 550
```

This allowed me to do an `apt remove` to the 12.1.1 install and reinstall 11.11.2.

```
$ sudo apt remove gitlab-ce
$ sudo apt install gitlab-ce
```

Because I pinned `gitlab-ce` to 11.11.2 it just reinstalled and now we're back to a functioning Gitlab. I just have to figure out how to safely more forward.

After the `dbconsole` drop tables etc. I decided to restore the backup that was taken at the beginning of the upgrade.

```
$ sudo gitlab-rake gitlab:backup:restore BACKUP=1564046471_2019_07_25_11.11.2
```

Then I edited the `/etc/apt/preferences.d/gitlab` preferences file and as it suggested in the original error pinned it to 12.0.0-ce, but again that failed.

The post I was seeing suggested that the problem begins at 11.11.3 with the geo nodes changes. So I pinned the version at 11.11.3\* and carried out that upgrade. **This worked successfully!**

Now to pin it to the top of the version 11 as 11.11.5\* ... **success!**

> Where it still fails is the upgrade to 12.0.0. So this is where I am was [https://gitlab.com/gitlab-org/gitlab-ce/issues/65118](https://gitlab.com/gitlab-org/gitlab-ce/issues/65118)

That was until it was pointed out that I needed to install the 11.11.5-ee (Enterprise Edition) first. Then install 12.0.0-ce (Community Edition) to upgrade it to 12.

This worked. Then I removed the `apt` pinning and let it upgrade to the latest release (12.1.1-ce) and we're all golden.

I did learn a lot about Gitlab during this process. So it wasn't in vain. Just a whole day of effort invested in something that should have only been 20 minutes of work. I'm just so glad this is on a Linux virtual host so I could snapshot it and rollback and use version pinning easily.
