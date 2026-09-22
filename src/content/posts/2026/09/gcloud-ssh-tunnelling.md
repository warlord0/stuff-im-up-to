---
pubDatetime: 2026-09-22T09:26:49Z
title: "GCloud SSH Tunnelling"
tags:
  - "google cloud"
  - "gcp"
  - "ssh"
  - "Security"
  - "Networking"
heroImage: "/blog-media/2026/09/gcloud-header.webp"
heroThumb: "/blog-media/2026/09/gcloud-thumb.webp"
description: "Close port 22 to the internet on GCP and still SSH in, using the Identity Aware Proxy to tunnel through instead of exposing SSH with firewall rules and public/private key pairs."
---

By default, Google expects you to open port 22 using firewall rules and allow your clients to connect to SSH using public/private key pairs. This really isn't the best plan for a secure environment. Even though you can secure your SSH with things like fail2ban and hosts.allow, and even add IP filters to your firewall rules, it's all a bit much to manage. It's simpler and more secure to just keep port 22 closed.

Conversely, [AWS is completely the opposite way around](/posts/aws-ssh-using-ssm/). It closes port 22 to the public internet and expects you to use AWS SSM to tunnel into SSH. After some investigation, I discovered GCloud supports the same method, you just need to configure things differently.

## Identity Aware Proxy (IAP)

Instead of just using SSH, even with the `gcloud compute ssh` command, you can use the Identity Aware Proxy (IAP) to tunnel the connection. This means SSH never needs to be reachable from the public internet at all - the proxy sits in front of it and authenticates the connection using your Google identity instead.

### Native GCloud SSH

```
gcloud compute ssh my-instance --project=my-project-123456 --zone=us-east4-b --tunnel-through-iap
```

You can use this from the command line, notice the `--tunnel-through-iap`.

### SSH Config

```
Host my-instance
    User myuser
    Port 22
    IdentityFile ~/.ssh/my_ssh_key
    IdentitiesOnly yes
    ProxyCommand gcloud compute ssh %h --tunnel-through-iap --zone=us-east4-b --project=my-project-123456 -- -W %h:%p
```

Using these methods, we are able to close the public internet port 22, whilst still being able to access SSH securely.

## Troubleshooting

You can be sure this won't work the first time you use it. Probably because you need to grant your user access to be able to use it. Run the troubleshooter, and it will tell you what the problem is.

```
gcloud compute ssh my-instance --project=my-project-123456 --zone=us-east4-b --troubleshoot --tunnel-through-iap
```

You should get something like this if all is good:

```
Starting ssh troubleshooting for instance https://compute.googleapis.com/compute/v1/projects/my-project-123456/zones/us-east4-b/instances/my-instance in zone us-east4-b
---- Checking network connectivity ----
The Network Management API is needed to check the VM's network connectivity.
If not already enabled, is it OK to enable it and check the VM's network connectivity? (Y/n)?  y
Network Connectivity Test Result: REACHABLE
---- Checking user permissions ----
User permissions: 0 issue(s) found.
---- Checking VPC settings ----
VPC settings: 0 issue(s) found.
---- Checking VM status ----
The Monitoring API is needed to check the VM's Status.
If not already enabled, is it OK to enable it and check the VM's Status? (Y/n)?  y
VM status: 0 issue(s) found.
---- Checking VM boot status ----
VM boot: 0 issue(s) found.
```

A typical failure looks like this, where you need to add a permission for the user:

```
---- Checking user permissions ----
User permissions: 1 issue(s) found.
You need permission to SSH to a private IP address: iap.tunnelInstances.accessViaIAP.
Help for IAP permissions: https://cloud.google.com/iap/docs/managing-access
```

## Grant Access to SSH

```
gcloud projects add-iam-policy-binding my-project-123456 \
        --member=user:myuser@mydomain.com \
        --role=roles/iap.tunnelResourceAccessor
```

## References

[Using IAP for TCP forwarding](https://cloud.google.com/iap/docs/using-tcp-forwarding)

[Managing access to IAP-secured resources](https://cloud.google.com/iap/docs/managing-access)
