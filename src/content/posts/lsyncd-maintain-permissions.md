---
pubDatetime: 2022-10-13T09:04:21Z
title: "Lsyncd Maintain Permissions"
tags:
  - "Linux"
  - "lsyncd"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "When synchronising files and folders with lsyncd I wanted to maintain the original owner and permissions. To do this I added the rsync stanza to my /etc/ls"
---
When synchronising files and folders with lsyncd I wanted to maintain the original owner and permissions.

To do this I added the `rsync` stanza to my `/etc/lsyncd/lsyncd.conf.lua`

```
settings {
  logfile = "/var/log/lsyncd/lsyncd.log",
  statusFile = "/var/log/lsyncd/lsyncd.status"
}

target_list = {
    "dvlaauction2.dh.bytemark.co.uk",
}

-- Docker

for _, server in ipairs(target_list) do

    sync {
        default.rsyncssh,
        source = "/srv/container-deployments",
        host = server,
        rsync = {
            _extra = {"-a"}
        },
        targetdir = "/srv/container-deployments";
    }

    sync {
        default.rsyncssh,
        source = "/srv/container-volumes",
        host = server,
        rsync = {
            _extra = {"-a"}
        },
        targetdir = "/srv/container-volumes";
    }

end
```
