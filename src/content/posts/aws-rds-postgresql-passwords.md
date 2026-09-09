---
pubDatetime: 2022-03-23T17:25:39Z
title: "AWS RDS PostgreSQL Passwords"
tags:
  - "Linux"
  - "postgresql"
description: "Working on a customer's AWS database instance, I found they didn't have all the passwords. I could get onto administer to AWS RDS database and instance, bu"
---
Working on a customer's AWS database instance, I found they didn't have all the passwords.

I could get onto administer to AWS RDS database and instance, but didn't have the `postgres` user password. I could log on as a user that had `CreateDB`, but how do I get to change the main `postgres` user password to something I know?

First thing was to change the master password for the `rdsadmin` user - easy enough as that's in the web console. But none of the documented passwords for the `postgres` user work.

Try logging into the instance from an AWS host using the `rdsadmin` user and get knocked back.

```
$ PGPASSWORD=SecretKey psql -h domain.eu-west-2.rds.amazonaws.com -U rdsadmin -d postgres

psql: error: FATAL:  pg_hba.conf rejects connection for host "10.0.0.219", user "rdsadmin", database "postgres", SSL on
FATAL:  pg_hba.conf rejects connection for host "10.0.0.219", user "rdsadmin", database "postgres", SSL off
```

And you can't edit `pg_hba.conf` on AWS.

## TLDR;

It's a very simple issue if you know it. Use the same password you just gave the `rdsadmin` user!

```
$ PGPASSWORD=SecretKey psql -h domain.eu-west-2.rds.amazonaws.com -U postgres            

psql (12.X (Ubuntu 12.X-0ubuntu0.XX.XX.XX), server 12.X)
SSL connection (protocol: TLSv1.2, cipher: ECDHE-RSA-AES256-GCM-SHA384, bits: 256, compression: off)
Type "help" for help.

postgres=>
```
