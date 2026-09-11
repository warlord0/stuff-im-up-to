---
pubDatetime: 2024-01-15T18:27:28Z
modDatetime: 2024-08-19T10:37:43Z
title: "PostgreSQL, repmgr and Barman"
tags:
  - "Linux"
  - "postgresql"
heroImage: "/blog-media/2018/02/best-postgresql-hosting.png"
description: "Initially, I started work on a Docker container build, but using the docker build provided some challenges with editing configurations to satisfy barman st"
---
Initially, I started work on a Docker container build, but using the docker build provided some challenges with editing configurations to satisfy barman streaming requirement. For this reason, I moved to carrying out a native installation using packages straight from the Debian repo - postgresql-15-repmgr and rsync.

```
sudo apt install postgresql-15-repmgr rsync
```

Once installed, followed the [repmgr quick start guide](https://www.repmgr.org/docs/current/quickstart.html) to the point where I needed to remove the 127.0.1.1 entry from the hosts file as it was preventing the registration and connection to the server due to no `pg_hba.conf` entry.

```
connection to server at "S00600" (127.0.1.1), port 5432 failed: fe_sendauth: no password supplied
```

The other alternative is to reorder the `pg_hba.conf` entries so that the repmgr connection appears before the all connection in IPv4 local connections:

```
# IPv4 local connections:
host    repmgr          repmgr          127.0.0.1/32            trust
host    all             all             127.0.0.1/32            scram-sha-256
```

## Getting it Working with Barman

The problem I initially experienced with barman set up the way we usually do it, is that when a failover occurs, barman breaks and the WAL's appear to get out of sync or disappear.

### ssh

I'm setting up replication to push the WAL's to barman using `barman-wal-archive`. This requires that you set up ssh connections between the servers for the barman user.

The notes suggest creating barman users and configuring keys to allow passwordless login between systems.

On the postgresql hosts, I created the barman user and then created keys and put the public key into the barman host's authorized_keys for the barman user. Seemed to make sense, but that's not how it works. Testing `barman-wal-archive` repeatedly complained about the host key not being in known_hosts. What really needed to be done was for the postgres user on the postgresql hosts to have keys to log on to the barman host as the barman user. Test it out using sudo:

```
sudo -u postgres bash
ssh barman@S00602
```

This should update the `known_hosts` first time round. From then on should connect without complaint or prompt. Then you can retest `barman-wal-archive`, eg.

```
sudo -u postgres /usr/bin/barman-wal-archive --test S00602 pg DUMMY
```

You can monitor the `auth.log` on the barman server S00602 to ensure it logs on. Then update the `archive_command` in `postgres.conf` with the `barman-wal-archive` command

I chose to create `custom.conf` file under `conf.d` to make it easy to differentiate my changes from then original.

#### custom.conf

```
archive_command = '/usr/bin/barman-wal-archive S00602 pg %p'
archive_mode = 'always'
hot_standby = 'on'
listen_addresses = '*'
max_replication_slots = 10
max_wal_senders = 10
shared_preload_libraries = 'repmgr'
wal_level = 'replica'
wal_log_hints = 'on'
```

Monitor the `auth.log` again, and you should see it log in successfully each time it ships a WAL.

In order to carry out a standby switchover, you also need to have an ssh connection as the postgres user to the other postgres servers as the user postgres. So you need to ensure you have keys generated and distributed to all the authorized_keys files on the postgres hosts.

#### /etc/repmgr.conf

```
node_id=2
node_name='S00601'
conninfo='host=S00601 user=repmgr dbname=repmgr connect_timeout=2'
data_directory='/var/lib/postgresql/15/main'
barman_host='barman@S00602'
barman_server='pg'
failover='automatic'
follow_command='repmgr standby follow'
promote_command='repmgr standby promote'
restore_command='/usr/bin/barman-wal-restore S00602 pg %f %p'
service_start_command   = 'sudo systemctl start postgresql'
service_stop_command    = 'sudo systemctl stop postgresql'
service_restart_command = 'sudo systemctl restart postgresql'
service_reload_command  = 'sudo systemctl reload postgresql'
```

#### /etc/sudoers.d/postgres

```
Defaults:postgres !requiretty
postgres ALL = NOPASSWD: /usr/bin/systemctl start postgresql, \
  /usr/bin/systemctl restart postgresql, \
  /usr/bin/systemctl reload postgresql, \
  /usr/bin/systemctl stop postgresql
```

## Proof of Switchover

Now it switches the primary over as it should.

> > It seemed to take a long time doing all this, maybe it needs a bit more investigation.

```
$ sudo -u postgres repmgr standby switchover --verbose
​
INFO: looking for configuration file in /etc
INFO: configuration file found at: "/etc/repmgr.conf"
NOTICE: executing switchover on node "S00601" (ID: 2)
INFO: searching for primary node
INFO: checking if node 1 is primary
INFO: current primary node is 1
INFO: SSH connection to host "S00600" succeeded
INFO: 0 pending archive files
INFO: replication lag on this standby is 0 seconds
NOTICE: attempting to pause repmgrd on 2 nodes
NOTICE: local node "S00601" (ID: 2) will be promoted to primary; current primary "S00600" (ID: 1) will be demoted to standby
NOTICE: stopping current primary node "S00600" (ID: 1)
NOTICE: issuing CHECKPOINT on node "S00600" (ID: 1) 
DETAIL: executing server command "sudo systemctl stop postgresql"
INFO: checking for primary shutdown; 1 of 60 attempts ("shutdown_check_timeout")
INFO: checking for primary shutdown; 2 of 60 attempts ("shutdown_check_timeout")
NOTICE: current primary has been cleanly shut down at location 0/24000028
NOTICE: promoting standby to primary
DETAIL: promoting server "S00601" (ID: 2) using pg_promote()
NOTICE: waiting up to 60 seconds (parameter "promote_check_timeout") for promotion to complete
INFO: standby promoted to primary after 9 second(s)
NOTICE: STANDBY PROMOTE successful
DETAIL: server "S00601" (ID: 2) was successfully promoted to primary
INFO: node "S00600" (ID: 1) is pingable
WARNING: node "S00600" not found in "pg_stat_replication"
INFO: waiting for node "S00600" (ID: 1) to connect to new primary; 1 of max 60 attempts (parameter "node_rejoin_timeout")
DETAIL: checking for record in node "S00601"'s "pg_stat_replication" table where "application_name" is "S00600"
WARNING: node "S00600" not found in "pg_stat_replication"
WARNING: node "S00600" not found in "pg_stat_replication"
WARNING: node "S00600" not found in "pg_stat_replication"
WARNING: node "S00600" not found in "pg_stat_replication"
WARNING: node "S00600" not found in "pg_stat_replication"
INFO: waiting for node "S00600" (ID: 1) to connect to new primary; 6 of max 60 attempts (parameter "node_rejoin_timeout")
DETAIL: checking for record in node "S00601"'s "pg_stat_replication" table where "application_name" is "S00600"
WARNING: node "S00600" not found in "pg_stat_replication"
WARNING: node "S00600" not found in "pg_stat_replication"
WARNING: node "S00600" not found in "pg_stat_replication"
WARNING: node "S00600" not found in "pg_stat_replication"
WARNING: node "S00600" not found in "pg_stat_replication"
INFO: waiting for node "S00600" (ID: 1) to connect to new primary; 11 of max 60 attempts (parameter "node_rejoin_timeout")
DETAIL: checking for record in node "S00601"'s "pg_stat_replication" table where "application_name" is "S00600"
WARNING: node "S00600" not found in "pg_stat_replication"
WARNING: node "S00600" not found in "pg_stat_replication"
INFO: node "S00600" (ID: 1) has attached to its upstream node
NOTICE: node "S00601" (ID: 2) promoted to primary, node "S00600" (ID: 1) demoted to standby
NOTICE: switchover was successful
DETAIL: node "S00601" is now primary and node "S00600" is attached as standby
NOTICE: STANDBY SWITCHOVER has completed successfully

$ sudo -u postgres repmgr cluster show 
​
 ID | Name   | Role    | Status    | Upstream | Location | Priority | Timeline | Connection string 
----+--------+---------+-----------+----------+----------+----------+----------+---------------------------------------------------------
 1  | S00600 | standby |   running | S00601   | default  | 100      | 5        | host=S00600 user=repmgr dbname=repmgr connect_timeout=2
 2  | S00601 | primary | * running |          | default  | 100      | 6        | host=S00601 user=repmgr dbname=repmgr connect_timeout=2
```

## Replication Status

```
postgres=# select * from pg_stat_replication;

  pid   | usesysid |     usename      |  application_name  |   client_addr   | client_hostname | client_port |         backend_start         | backend_xmin |   state   |  sent_lsn  | write_lsn  | flush_lsn  | replay_lsn |   write_lag    |    flush_lag    |   replay_lag    | sync_priority | sync_state |          reply_time           
--------+----------+------------------+--------------------+-----------------+-----------------+-------------+-------------------------------+--------------+-----------+------------+------------+------------+------------+----------------+-----------------+-----------------+---------------+------------+-------------------------------
 901522 |    16389 | streaming_barman | barman_receive_wal | 192.168.121.216 |                 |       55450 | 2024-01-11 22:08:34.966044+00 |              | streaming | 0/29003550 | 0/29003550 | 0/29000000 |            | 00:00:08.79749 | 10:40:27.097869 | 10:41:25.620055 |             0 | async      | 2024-01-12 08:50:00.61161+00
 902520 |    16390 | repmgr           | S00601             | 192.168.121.23  |                 |       34272 | 2024-01-11 22:14:28.621751+00 |              | streaming | 0/29003550 | 0/29003550 | 0/29003550 | 0/29003550 |                |                 |                 |             0 | async      | 2024-01-12 08:50:00.225096+00
(2 rows)
```

## repmgrd

This doesn't seem to work properly. Despite editing the `/etc/default/repmgr` file, it does not start.

I decided to stop and disable the service based on `init.d` and then create my own systemd file.

### /etc/systemd/system/repmgrd.service

```
[Unit]
Description=Repmgrd service
After=network.target

[Service]
ExecStart=/usr/bin/repmgrd --pid-file=/run/repmgrd/repmgrd.pid -f /etc/repmgr.conf
#ExecStop=/usr/bin/killall repmgrd
#ExecStop=/bin/kill $MAINPID
User=postgres
Restart=always
PIDFile=/run/repmgrd/repmgrd.pid
Type=simple

[Install]
WantedBy=default.target
RequiredBy=network.target
```

This starts the service and can be seen as connected, looking at the service status:

```
$ sudo -u postgres repmgr service status 
 ID | Name   | Role    | Status    | Upstream | repmgrd | PID     | Paused? | Upstream last seen
----+--------+---------+-----------+----------+---------+---------+---------+--------------------
 1  | S00600 | primary | * running |          | running | 1027759 | no      | n/a 
 2  | S00601 | standby |   running | S00600   | running | 543377  | no      | 1 second(s) ago 
```

## Failover Commands

From standby server you want to promote:

```
sudo -u postgres repmgr standby switchover --verbose
sudo -u postgres repmgr service status
```

From the primary, that is now down and needs to become a standby:

```
sudo -u postgres repmgr -h S00600 -U repmgr -d repmgr -f /etc/repmgr.conf standby clone --force
sudo -u postgres repmgr standby register --force
```

The `clone --force` deletes the existing data directory and obtains a fresh base backup from the barman server

If you try to fail back too quickly and no WAL's have been shipped, then it's possible to see issues with it failing, as the process waits for 30 seconds trying to flush WAL's to disk. When this does not happen, the switchover fails. You can just go back to the old primary and restart postgres to put it back as it was.

## Barman

The first barman backup won't be available until some WAL traffic happens. Kick-start it using:

```
sudo barman switch-xlog --force --archive pg
```

### Taking Backups

Making a manual backup, or the command to add to a cron.

```
sudo barman backup pg --wait
```

### Listing and testing backups

```
sudo barman list-backups pg
sudo barman list-backups pg
sudo barman verify-backup pg 20240112T134631
```

For verify to work, you may have to link `pg_verify` into your path, eg.

```
sudo -s /usr/lib/postgresql/15/bin/pg_verifybackup /usr/bin/pg_verifybackup
```

### Failing Over Barman

Barman needs to be told that the primary has changed, or it will fail to continue doing backups.

There is a feature of postgres that will trigger a script hook when a recovery is completed - `recovery_end_command`.

I have used this to ssh onto the barman server and run a command to change the config file so that it points to the new primary.

#### postgresql.conf

```
recovery_end_command = 'ssh S00602 /usr/local/bin/recovery_end --host S00600'
```

> For this to work, it must be able to ssh onto the barman server as the barman user, with no password prompt. If it is not able to do this, then the switchover will fail and the postgres server will not be started.

Ensure this is able to log on by adding a `~/.ssh/config` file for the postgres user, eg.

```
Host S00602
  User barman
```

#### /usr/local/bin/recovery_end

```
#!/bin/bash

function render_template() {
  eval "echo \"$(cat $1)\""
}

while [ $# -gt 0 ]; do
  case "$1" in
    -h|--host)
      shift;
      PGHOST=$1
      ;;
  *)
    exit 1
    ;;
  esac
  shift
done

render_template /etc/barman.d/pg.template > /etc/barman.d/pg.conf

barman cron
```

It processes this template file and overwrites the `pg.conf`

```
[pg]
description = "PostgreSQL Database"
conninfo = host=${PGHOST} port=5432 user=barman dbname=postgres
streaming_conninfo = host=${PGHOST} port=5432 user=streaming_barman
backup_method = postgres
streaming_archiver = on
slot_name = barman
create_slot = auto
#minimum_redundancy = 4
archiver = on
retention_policy = RECOVERY WINDOW OF 7 DAYS
```

## Barman Cloud Backup

Whilst working on this I discovered barman supports archiving to a cloud store like S3, Google or Azure. I have a Minio S3 server, and thought I'd give it a try. This could be especially useful for AWS customers who want to use barman as a point in time recovery.

I installed `awscli`, just so I could create the credentials file with `aws credentials` pasted in the ID and key from my Minio server, eg.

```
cat ~/.aws/credentials

[default]
aws_access_key_id = s8e2o11GlHknHOfQVC1j
aws_secret_access_key = xIGicrVJtx48AJ1JX1uZUX7p3Dqm3g2AHWc71Drz
```

From there, I just had to get the syntax right.

```
sudo barman-cloud-backup -v -z --cloud-provider aws-s3 --endpoint-url=https://backup.domain.tld s3://bucket/ -d 'host=localhost port=5432 user=postgres dbname=postgres password=SuperSecretKey' pg
```

I could not get it to work with the format `s3://backup.domain.tld/bucket/`. I needed to read up a bit more on how it worked with AWS.

It requires a separate `--endpoint-url` otherwise it would try to make a URL that includes the region from the credentials file. As Minio does no use a region in that way, it would always error about the format of the region being wrong. Once I specified the URL and separated the bucket name as the `s3:/bucket/` parameter, it began baching up my database to my Minio server.

> `--endpoint-url` override the default S3 URL construction mechanism by specifying an endpoint

This script can be used in conjunction with `post_backup_script` or `post_backup_retry_script` to relay barman backups to cloud storage as follows:

```
post_backup_retry_script = 'barman-cloud-backup [*OPTIONS*] *DESTINATION_URL* ${BARMAN_SERVER}'
```

When running as a hook script, `barman-cloud-backup` will read the location of the backup directory and the backup ID from `BACKUP_DIR` and `BACKUP_ID` environment variables set by barman.

## Restoring from Barman

Restoring your system from a backup involves using `barman recovery`. There are a number of option and methods to do this. You can recover to a local folder easily and then manually copy things back where they need to be, or you can issue a remote ssh command and have the restore placed onto a remote host.

### Local Recovery

This will restore the database to the specified target time, which must be after the backup end time that you can see using `barman list-backups pg`

```
barman recover --target-time "2024-01-17 00:00:00.000" pg 20240116T145449 /tmp/restore
```

### Remote Recovery

Restoring to a remote location using ssh requires that the target can be connected to without requiring a password prompt. This means you need to use a private key (without a password) and that when using ssh the remote does not ask for a password, and accepts the private key.

Even though you are using `sudo` to call barman, you may find ssh to the remote does not work. This is because it will be using the barman user on the barman server to connect from. Any private key you need to install needs to be for the barman user. The safest way to handle it is to `sudo -u barman bash` then create or manage your keys. These will be in the barman user's home folder `/var/lib/barman/.ssh`. You may want to consider creating an ssh `config` file with the Host parameters that allow passwordless connections to work.

```
barman recover --target-time "2024-01-17 00:00:00.000" --remote-ssh-command="ssh 192.168.0.222" pg 20240116T145449 /tmp/restore
```

The ssh user must also have permission to the location to restore to.

## References

[https://postgreshelp.com/postgresql-timelines/](https://postgreshelp.com/postgresql-timelines/)

[https://www.repmgr.org/docs/5.3/index.html](https://www.repmgr.org/docs/5.3/index.html)

[https://docs.pgbarman.org/release/3.4.0/](https://docs.pgbarman.org/release/3.4.0/)

[https://docs.pgbarman.org/release/2.19/barman-cloud-backup.1.html](https://docs.pgbarman.org/release/2.19/barman-cloud-backup.1.html)

[https://www.enterprisedb.com/docs/supported-open-source/barman/single-server-streaming/step04-restore/](https://www.enterprisedb.com/docs/supported-open-source/barman/single-server-streaming/step04-restore/)
