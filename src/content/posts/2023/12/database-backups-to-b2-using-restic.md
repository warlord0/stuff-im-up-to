---
pubDatetime: 2023-12-15T20:42:23Z
title: "Database Backups to B2 Using Restic"
tags:
  - "b2"
  - "Linux"
  - "s3"
heroImage: "/blog-media/2023/12/restic.png"
description: "You can always back up the databases to a file and then back up those files to Backblaze B2 or AWS S3 using restic, but how about streaming a backup direct"
---
You can always back up the databases to a file and then back up those files to Backblaze B2 or AWS S3 using restic, but how about streaming a backup directly to object storage with no local copy?

Turns out it was easy to do. Pipe the backup through pigz/gzip and then into restic as a stdin.

```
pg_dumpall --clean -U postgres \
 | pigz --rsyncable \
 | restic backup \
  --host "myhostname"
  --stdin --stdin-filename \
  postgresql.sql.gz
```

This takes a PostgreSQL full backup and compresses it with `pigz` before sending it to `restic` to handle as a backup of `stdin` to the file name `postgresql.sql.gz`

The same principle can be used for MariaDB/MySQL

```
mysqldump -u root -pSuperSecretKey mydatabase \
 | pigz --rsyncable \
 | restic backup \
  --host "myhostname" \
  --stdin --stdin-filename \
  mydatabase.sql.gz
```

It's just as tidy to use this to back up your docker containerised databases using `docker compose exec`.

```
docker compose exec -T db \
 pg_dumpall --clean -U postgres \
  | pigz --rsyncable \
  | restic backup \
  --host "myhostname"
  --stdin --stdin-filename \
  postgresql.sql.gz
```
