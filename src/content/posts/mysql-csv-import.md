---
pubDatetime: 2019-07-24T15:01:26Z
modDatetime: 2019-07-24T20:43:25Z
title: "MySQL CSV Import"
tags:
  - "Linux"
  - "mysql"
heroImage: "/blog-media/2019/07/mariadb-1.png"
description: "A little while ago I wrote a php routine to import CSV files that contain a lot of data into a MySQL table. It works, but it takes it's time doing so. I wa"
---
A little while ago I wrote a php routine to import CSV files that contain a lot of data into a MySQL table. It works, but it takes it's time doing so.

I was originally reading each line using a CSV parser and then writing each line into the table. I have 28+ files each containing 200MB of data in a million rows in each file.

Now for a change.

There are of course pros and cons to the situation. As a row by row the error handling is pretty thorough. But it's not very fast.

Also as I'm truncating the table before I begin the import any users querying the data during the import process is not going to get any results.

> A total change of approach is needed.

Instead of the line by line we'll make use of the built in MySQL function for [LOAD DATA](https://dev.mysql.com/doc/refman/8.0/en/load-data.html). The downside of this is that we have permissions to deal with. The user running the MySQL process as needs to have access to the operating system and files we want to import and the MySQL user running the import needs permission to use `LOAD DATA` in MySQL.

First let's grant the MySQL user access to `LOAD DATA` by using the MySQL command:

```
]> GRANT FILE ON *.* to 'username'@'localhost';
```

*You're not reading it wrong, you do have to use `*.*` as you can't limit FILE access to just your database.*

Now we need to give access to the `.csv` files that we want to import to the user that owns the MySQL process. A quick way of doing this is using `ps`:

```
$ ps -fC mysqld                                                                   
 UID        PID  PPID  C STIME TTY          TIME CMD
 mysql     1100     1  2 07:42 ?        00:11:15 /usr/sbin/mysqld
```

As expected the UID happens to be `mysql`.

I extract my `.csv` files from a `.zip` and put them into the `/tmp` folder:

```
$ unzip ~/ABPOGB_CSV.zip
```

In my case this created the structure `/tmp/data` which contained my `.csv` files. I need to `chown` the files for `mysql` to have access and then import them. I can do all this in a bash script:

### importsql.sh

```
#!/bin/sh

dir="/tmp/data"

cd $dir

for file in *.csv
do
  echo $file
  chown mysql:mysql $dir/$file
  mysql mydatabase -e "LOAD DATA INFILE '"$dir/$file"' INTO TABLE mytable CHARACTER SET utf8 fields terminated by ',' ENCLOSED by '\"' LINES TERMINATED BY '\r\n';"
  # Tidy those files up?
done
```

Because the files come from a windows system they are line terminated with CRLF. I also had to include the character set and delimiter and enclosure to successfully read the file.

Right now I run this with `sudo` so it has the ability to `chown` the files and import them. Ideally this would be called in a queued `supervisord` process.

```
$ sudo sh ./importsql.sh
```

The outcome of this was that on my system the import into MySQL was down to only around 11 seconds per file. A massive improvement over the 10+ minutes per file doing it line by line.

The next steps are after the import is successful, I delete/drop the old table and then rename the newly imported one using `RENAME TABLE`. This means the downtime between old data and new is significantly reduced.

I have also noticed that during the bash script `LOAD DATA` script the CPU utilisation isn't getting battered. So there stands a good chance of being able to deal with business as usual whilst the fresh load is happening. What helped this along was the creation of the empty table and NOT adding any UNIQUE columns to it whilst empty. This way the import happens without duplicate checking and I can then use `ADD CONSTRAINT` to add my unique column requirements after the import has finished.

```
]> alter table mytable add constraint uc_uprn unique (uprn);
```

### Spacial Changes

There are a few other MySQL tasks that I need to carry out on my particular data-set. Once I know it's unique I then add a `GEOMETRY` column as I'm using the data as part of a spacial/mapping system. It already has latitude and longitude in the file as regular numbers, now I need to convert them to spacial `POINTS`.

```
]> alter table mytable add column geom GEOMETRY;
]> update mytable set geom = Point(longitude, latitude);
```

### In Conclusion

The post processing of the uploaded data, adding a unique constraint, adding and updating the geometry column added about 20 minutes to the process, but it was still significantly shorter than the row by row method.

------------------------------------------------------------------------

[MariaDB](https://mariadb.org/about/)
