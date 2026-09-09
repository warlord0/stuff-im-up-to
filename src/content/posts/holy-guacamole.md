---
pubDatetime: 2022-11-18T11:29:37Z
title: "Holy Guacamole!"
tags:
  - "Linux"
  - "rdp"
  - "remote-desktop"
  - "Windows"
description: "Apache Guacamole - not the answer I was looking for, but impressive. I wanted to get a remote desktop session to a client machine to support them in the se"
---
Apache Guacamole - not the answer I was looking for, but impressive.

I wanted to get a remote desktop session to a client machine to support them in the session they are currently working in. On my journey, I encountered guacamole and installed it. Have to say I'm impressed, but what it isn't is a remote desktop support tool. It's a HTML5 server that can proxy connections to services such as RDP and SSH. It doesn't solve the issue of joining a users existing RDP session on Linux, but it does make an RDP connection and give me full access to a Linux XFCE desktop in Linux Mint.

I followed a few guides to get the installation done. The [project documentation](https://guacamole.apache.org/doc/gug/installing-guacamole.html) is a good start to getting Tomcat and guacd running, but creating a config and making it connect to stuff I found this particularly useful, for getting the config and user mapping done: [https://www.tecmint.com/guacamole-access-remote-linux-windows-machines-via-web-browser/](https://www.tecmint.com/guacamole-access-remote-linux-windows-machines-via-web-browser/)

Once installed, I then visited the Tomcat webpage [http://myserver:8080/guacamole](#). Logon using the credentials I put in `user-mapping.xml` and I'm away. Then I can choose the connection I want to connect to.

Whilst I probably won't use this on a desktop, I may install it on a server and use it as a gateway to other systems on the LAN.

![](/blog-media/2022/11/desktop.png)
