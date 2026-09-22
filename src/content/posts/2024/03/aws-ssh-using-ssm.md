---
pubDatetime: 2024-03-14T15:36:11Z
modDatetime: 2026-09-22T16:46:08Z
title: "AWS SSH using SSM"
tags:
  - "amazon"
  - "aws"
  - "Linux"
  - "ssh"
heroImage: "/blog-media/2024/03/aws_logo.webp"
heroThumb: "/blog-media/2024/03/aws_logo-thumb.webp"
description: "Access a closed-off AWS EC2 instance over SSH using SSM as a proxy, so no port ever needs to be exposed on the instance. Includes a real-world ssh config entry with a friendly host alias, an AWS profile, and a note on why StrictHostKeyChecking gets disabled."
---
You can access a closed off AWS EC2 instance using SSH by using SSM as a proxy. This means no ports need be exposed from your EC2 at all.

Configure the AWS Client

```
aws configure
```

Specify your user access key, secret and region.

Connect to the EC2 instance

```
aws ssm start-session --target [instance_id]
```

Connect to SSH through an SSM port forward

```
aws ssm start-session --target [instance_id] \
  --document-name AWS-StartPortForwardingSession \
  --parameters '{"portNumber":["22"], "localPortNumber":["2222"]}'

ssh -p 2222 -i ~/.ssh/id_rsa root@localhost
```

## A Real-World SSH Config

Running the `aws ssm` commands by hand every time gets tedious, so it's worth putting the proxy command into `~/.ssh/config` instead. Here's an entry from my own config, sanitised:

```
Host web-1
  User ubuntu
  Hostname i-0123456789abcdef0
  IdentityFile ~/.ssh/my_aws_key
  IdentitiesOnly yes
  ProxyCommand sh -c "aws ssm start-session --profile my-aws-profile --region eu-west-2 --target %h --document-name AWS-StartSSHSession --parameters 'portNumber=%p'"
  StrictHostKeyChecking=no
  UserKnownHostsFile=/dev/null
```

`ssh web-1` now works exactly like SSH to any other host, and so does everything built on it, `scp`, `rsync -e ssh`, port forwards, Git and Ansible pointed at the host by name.

A few things worth calling out:

- **`Host` vs `Hostname`** - `web-1` is just a friendly name I chose; the actual instance ID lives in `Hostname`. SSH expands `%h` in `ProxyCommand` to the `Hostname` value, not the alias, so the SSM command still gets the real instance ID even though I never type it. This is the opposite approach to the wildcard `host i-* mi-*` pattern in [AWS: SSH using Systems Manager](/posts/aws-ssh-using-systems-manager/) - that one lets you `ssh` straight to any instance ID without adding a config entry per host; this one trades that flexibility for memorable names, at the cost of adding an entry per instance.
- **`--profile`** - if you manage more than one AWS account, this picks the right one from `~/.aws/config` without having to export `AWS_PROFILE` first.
- **`IdentitiesOnly yes`** - stops ssh offering every other key it knows about before trying the one that's actually meant for this host, particularly useful when `ssh-agent` is holding several.
- **`StrictHostKeyChecking=no` and `UserKnownHostsFile=/dev/null`** - the session is tunnelled through SSM rather than a direct TCP connection, and the instance behind a given ID can be replaced by autoscaling or a rebuild, so there's no stable host key to pin in the usual way. Disabling the check is convenient, but it does mean ssh won't warn you if something else ends up answering on that instance ID, so treat it as a deliberate trade-off rather than a default to copy everywhere.

## References

[https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-getting-started-enable-ssh-connections.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-getting-started-enable-ssh-connections.html)

[https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html#sessions-start-ssh](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html#sessions-start-ssh)
