---
pubDatetime: 2018-02-22T09:20:52Z
modDatetime: 2018-02-23T17:45:45Z
title: "MariaDB Apparmor and No login"
tags:
  - "database"
  - "Linux"
  - "mysql"
description: "As I've been messing around with Sphinx I discovered that MariaDB actually includes the SphinxSE plugin out of the box. So I figured I'd ditch my MySQL ins"
---
As I've been messing around with Sphinx I discovered that MariaDB actually includes the SphinxSE plugin out of the box. So I figured I'd ditch my MySQL installation on Debian and go back to the default Debian repository version MariaDB.

    $ sudo apt-get remove mysql-server mysql-client

    $ sudo apt-get install mariadb-server mariadb-client

This didn't go to plan. Firstly it failed to run the apt configure scripts for `mariadb-server-10.1` so it would not complete the install. Checking the logs

    Feb 21 15:52:29 mypc kernel: [ 323.603758] audit: type=1400 audit(1519228349.780:26): apparmor="DENIED" operation="open" profile="/usr/sbin/mysqld" name="/etc/mysql/mariadb.conf.d/" pid=5175 comm="mysqld" requested_mask="r" denied_mask="r" fsuid=0 ouid=0

It goes back to a previous post I made about [apparmor and MySQL](https://warlord0blog.wordpress.com/2018/01/18/mysql-broken-after-apt-upgrade/). This time the problem was because the config file paths/names are different.

    name="/etc/mysql/mariadb.conf.d/

So I looked in the apparmor confing and found a new file which has a big clue at the top of it `usr.sbin.mysqld.pkgd-dist`.

> \# This file is intensionally empty to disable apparmor by default for newer \# versions of MariaDB, while providing seamless upgrade from older versions \# and from mysql, where apparmor is used.

But because I already have an apparmor file `usr.sbin.mysqld` I can either replace it with the empty dist one or edit it to add the requirements. I had to add in capability dac_read_search and amend the paths for the config files. But as I also wanted the SphinxSE (Sphinx Storage Engine) plugin I also had to add the lib paths with a permission of `m` for the folder `/usr/lib/x86_64-linux-gnu/mariadb18/plugin/`.

    # vim:syntax=apparmor
    # Last Modified: Tue Jun 19 17:37:30 2007
    #include <tunables/global>

    /usr/sbin/mysqld {
     #include <abstractions/base>
     #include <abstractions/nameservice>
     #include <abstractions/user-tmp>
     #include <abstractions/mysql>
     #include <abstractions/winbind>

     capability dac_override,
     capability sys_resource,
     capability setgid,
     capability setuid,
     capability dac_read_search,

    network tcp,

     /etc/hosts.allow r,
     /etc/hosts.deny r,

    /etc/mysql/*.pem r,
    /etc/mysql/conf.d/ r,
     /etc/mysql/conf.d/* r,

     /etc/mysql/*.conf.d/ r,
     /etc/mysql/*.conf.d/* r,
     /sys/devices/system/node/* r,
     /etc/mysql/*.cnf r,
     /run/mysqld/* rw,

     /usr/lib/mysql/plugin/ r,
     /usr/lib/mysql/plugin/*.so* mr,
     /usr/sbin/mysqld mr,
     /usr/share/mysql/** r,
     /var/log/mysql.log rw,
     /var/log/mysql.err rw,
     /var/lib/mysql/ r,
     /var/lib/mysql/** rwk,
     /var/log/mysql/ r,
     /var/log/mysql/* rw,
     /var/run/mysqld/mysqld.pid rw,
     /var/run/mysqld/mysqld.sock w,
     /var/run/mysqld/ rw,
     /var/run/mysqld/* rw,
     /run/mysqld/mysqld.pid rw,
     /sys/devices/system/cpu/ r,
     
     /usr/lib/x86_64-linux-gnu/mariadb18/plugin/ r,
     /usr/lib/x86_64-linux-gnu/mariadb18/plugin/* m,

    # Site-specific additions and overrides. See local/README for details.
    #include <local/usr.sbin.mysqld>

## Losing the MySQL Data

After the apparmor changes. The change to MariaDB still failed. I had to sacrifice the existing MySQL data by deleting the `/var/lib/mysql` folder. Then the install completed!

## Unable to Logon

The next challenge was not being able to logon to MySQL as root. This is actually really straight forward and I like the change. MariaDB forces the root logon to use the Unix account of the same name to be able to logon. So you must sudo.

    $ sudo mysql

or

    $ sudo mysql -u root

No password is required beyond that of sudo. But I then created a new user and could not logon to that account at all.

    MariaDB> grant all on schema.* to fred@localhost identified by 'mysupersecretpassword';

But try as I might `fred` could not logon. I deleted the user from the user table and recreated it.

    MariaDB> grant all on schema.* to 'fred'@'localhost' identified by 'mysupersecretpassword';

Success. I could now logon as `fred`. It seems that the single quotes around the username and host are important!
