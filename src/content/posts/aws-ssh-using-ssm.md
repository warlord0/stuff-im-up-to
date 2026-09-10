---
pubDatetime: 2024-03-14T15:36:11Z
modDatetime: 2024-03-15T17:49:43Z
title: "AWS SSH using SSM"
tags:
  - "amazon"
  - "aws"
  - "Linux"
  - "ssh"
heroImage: "/blog-media/2024/03/aws_logo.png"
description: "You can access a closed off AWS EC2 instance using SSH by using SSM as a proxy. This means no ports need be exposed from your EC2 at all. Configure the AWS"
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

## References

[https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-getting-started-enable-ssh-connections.html](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-getting-started-enable-ssh-connections.html)

[https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html#sessions-start-ssh](https://docs.aws.amazon.com/systems-manager/latest/userguide/session-manager-working-with-sessions-start.html#sessions-start-ssh)
