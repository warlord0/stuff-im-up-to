---
pubDatetime: 2018-02-20T10:42:24Z
modDatetime: 2018-03-09T08:59:52Z
title: "PostgreSQL Copy Data Between Servers"
tags:
  - "Linux"
  - "postgresql"
  - "Windows"
description: "Our GIS team use a PostgreSQL server with PostGIS. They recently asked if there was any way we could display some data in a simple web form for our users."
---
Our GIS team use a PostgreSQL server with PostGIS. They recently asked if there was any way we could display some data in a simple web form for our users. So a bit of development work was required. I didn't want to code against their live system so thought I'd install a local version of PostGIS and copy the data from their database. The database they wanted to access has 28 million rows - so it's going to take a while. The actual process was pretty straight forward. On my Debian Linux host Installing PostGIS installs PostgreSQL automatically as a dependency.

    $ sudo apt-get install postgis

This installed PostgreSQL version 10. The current GIS system is on 9.6. So there could be a problem here. First thing I needed to do was create a user account for me to use. That should be straight forward, but not being familiar with Postgres I couldn't even get past logging on as the `postgres` super user. By default there is no password for the `postgres` user. The `pga_hba.conf` file requires you to logon at the OS as postgres. So it's a simple case of `sudo` to logon and create a user.

    $ sudo -u postgres psql

    postgres=# create user myuser;
    postgres=# alter user myuser with superuser;
    postgres=# alter user myuser password 'mypassword';

> I've listed the commands used separately. I know you can do this in one pass, but this acts as a reminder of how to change a users password and make them a superuser if they already exist.

Now I can just connect as myself using

    $ psql -d postgres

I had to specify a database (with the `-d` option) as there is no database matching my user id.

## PGAdmin 4

With the server installed and running I'll install the GUI admin tool PGAdmin 4. This requires adding a source list file to `/etc/apt/sources.list.d` as advised I used `pgdg.list` and added the repository for `sid` - my version of Debian.

    deb http://apt.postgresql.org/pub/repos/apt/ sid-pgdg main

You need to add the key for the repository which you can get from the Wiki here: [https://wiki.postgresql.org/wiki/Apt](https://wiki.postgresql.org/wiki/Apt)

    $ sudo apt-key add pgdg.asc

Then it's a simple case of doing an update, install and run.

    $ sudo apt-get update
    $ sudo apt-get install pgadmin4
    $ pgadmin4

## Copy the Data Across

Using PGAdmin 4 I created a suitable tablespace and a database to import into. The transfer was made easier following this post: [https://stackoverflow.com/questions/1237725/copying-postgresql-database-to-another-server](https://stackoverflow.com/questions/1237725/copying-postgresql-database-to-another-server) I didn't have to write out an intermediate file. Just pipe the pg_dump straight into psql . The transfer migrates without having allow for a 14GB backup file and no need to follow up with a `pg_restore`  command.

    $ pg_dump -h sourceserver -U gisuser -p 5432 -d sourcedatabase | psql -d destdatabase

I struggled with pg_dump to start with. This was mainly because the GIS system is actually running two versions of PostreSQL - 9.1 and 9.6. My connection to the server kept returning an error message telling me the database did not exist when it clearly does. This was simply because I wasn't specifying the port number for the 9.6 instance and was connecting to 9.1 and the database didn't exist in there. So 9.1 was using the default port of 5432, 9.6 was using 5433. So adding a `-p` parameter resolved that problem. The copy even handled the version difference between 9.6 to 10. So now I have a local version 10 system with all the data I need to play with.
