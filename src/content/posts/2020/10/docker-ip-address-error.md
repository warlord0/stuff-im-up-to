---
pubDatetime: 2020-10-02T09:02:50Z
modDatetime: 2020-10-02T09:13:17Z
title: "Docker IP Address Error"
tags:
  - "Docker"
  - "Linux"
heroImage: "/blog-media/2020/01/moby-logo.png"
description: "ERROR: could not find an available, non-overlapping IPv4 address pool among the defaults to assign to the network We have a staging environment that runs a"
---
> ERROR: could not find an available, non-overlapping IPv4 address pool among the defaults to assign to the network

We have a staging environment that runs a lot of container sets for customer testing and recently I went to add a new container set ad got the above error.

On my own system I saw this kind of issue when I ran out of IP pool space because it overlapped with the VPN I was using. I solved it by creating another docker network and using an override to add it to my container set. I didn't want to do the same here, but testing it out by adding the network revealed I was out of IP pool space.

Searching around I found that Docker issues a huge subnet to each container set you build. So whilst each of my dockers was getting an IP address the range it has it a /20 subnet so for even the smallest single service container it consumed 4096 IP addresses!

You can evidence this by inspecting the config of the container and look at the Networks section. You'll see it the `IPPrefixLen` is set to 20.

```
"Networks": {
    "s00344_default": {
        "IPAMConfig": null,
        "Links": null,
        "Aliases": [
        "db",
        "872a566030f0"
        ],
        "NetworkID": "22f3e2aba535c6811f882dff8e162937de665902e2e65c8b043971cbd98cd365",
        "EndpointID": "1a503a15164a3f618a2cbec6a829d58a2a2dba0967567b908ce85dc54b252207",
        "Gateway": "192.168.64.1",
        "IPAddress": "192.168.64.2",
        "IPPrefixLen": 20,
        "IPv6Gateway": "",
        "GlobalIPv6Address": "",
        "GlobalIPv6PrefixLen": 0,
        "MacAddress": "02:42:c0:a8:40:02",
        "DriverOpts": null
    }
}
```

I need to alter this behaviour and reduce the IPPrefixLen settings down to something more sensible like 24.

This will require a restart of Docker.

Edit or create the `/etc/docker/daemon.json` file and add in the following:

```
{
    "default-address-pools": {
      { "base": "192.168.0.0/16", "size": 24 }
    }
}
```

Changing the base IP address to one suited to your environment.

Restart Docker and you should now have reduced the number of IP's allocated dramatically and can now add more container sets to the default pool.
