---
pubDatetime: 2024-03-14T15:23:42Z
modDatetime: 2024-03-14T15:58:33Z
title: "AWS S3 Bucket Service"
tags:
  - "amazon"
  - "aws"
  - "Linux"
  - "Networking"
  - "s3"
heroImage: "/blog-media/2024/03/aws_logo.png"
description: "Previously I have used s3fs as this supported mounting in fstab using and access key and secret. This S3 Mountpoint by Amazon can use IAM for a more integr"
---
Previously I have used `s3fs` as this supported mounting in `fstab` using and access key and secret. This S3 Mountpoint by Amazon can use IAM for a more integrated authentication approach.

Install or update to the latest version of the AWS CLI - AWS Command Line Interface (amazon.com)

## Installing S3 Mountpoint - Amazon Simple Storage Service

Pre-requisites:

```
apt-get install unzip libfuse2
```

### Install awscli

```
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install
/usr/local/bin/aws --version
```

### Install Mountpoint

```
wget https://s3.amazonaws.com/mountpoint-s3-release/latest/x86_64/mount-s3.deb
dpkg -i mount-s3.deb 
```

### Configure s3 service

```
mkdir /mnt/s3
vim /etc/systemd/system/s3.service
systemctl enable --now s3.service
systemctl start  s3.service
systemctl status s3.service
```

Create `/etc/systemd/system/s3.service` as below:

```
[Unit]
Description=Mountpoint for Amazon S3 mount
Wants=network.target
AssertPathIsDirectory=/mnt/s3

[Service]
Type=forking
User=root
Group=root
ExecStart=/usr/bin/mount-s3 [bucket] /mnt/s3
ExecStop=/usr/bin/fusermount -u /mnt/s3

[Install]
WantedBy=remote-fs.target
```
