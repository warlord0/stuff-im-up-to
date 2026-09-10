---
pubDatetime: 2019-10-23T19:42:39Z
modDatetime: 2019-10-23T19:44:58Z
title: "JumpCloud"
tags:
  - "active directory"
  - "ldap"
  - "Linux"
  - "Windows"
heroImage: "/blog-media/2019/10/press-release-post-template-jc.jpg"
description: "Sometimes I'm surprised at why I've never come across things before. This is a big one for me. For the longest time I was pondering how to resolve some SSO"
---
Sometimes I'm surprised at why I've never come across things before. This is a big one for me. For the longest time I was pondering how to resolve some SSO requirements whilst maintaining a corporate managed directory and not spending a fortune. Traditionally this would be the infrastructure to get the likes of Azure Active Directory, ADFS, RADIUS and multi-factor authentication - and then BOOM! JumpCloud.

What I really liked about this is that I got my own directory setup in under 15 minutes and had a Linux client logging on using my SSH key. I haven't had to do anything laborious just install the JumpCloud agent onto the machine. Once I created my user account on the cloud interface and (optionally) gave it my SSH key I was set.

The JumpCloud agent handles replicating my account to the "systems" I install the agent on. It also delivers my SSH key for me so I can connect securely to the systems I'm allocated immediately.

> **Auth and Management for SSO, LDAP, RADIUS, Mac, Windows, Linux, and More**
>
> As a new user I get 10 FREE accounts which is plenty to setup my own directory for home and testing. I didn't even need a credit card.

```
 https://jumpcloud.com/
```
