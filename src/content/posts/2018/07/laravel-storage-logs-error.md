---
pubDatetime: 2018-07-19T09:16:35Z
modDatetime: 2018-07-19T09:17:26Z
title: "Laravel storage/logs Error"
tags:
  - "Laravel"
  - "Linux"
heroImage: "/blog-media/2016/09/laravel.jpg"
description: "A regular issue for me is failing the initial deployment of a git clone Laravel server using Nginx. It's almost always because I forget to create and give"
---
A regular issue for me is failing the initial deployment of a `git clone` Laravel server using Nginx. It's almost always because I forget to create and give permissions to the Nginx user `www-data`.

```
UnexpectedValueException
There is no existing directory at "/var/www/myproject/storage/logs" and its not buildable: Permission denied
```

Then even if I do sort the permissions here it fails again with:

```
InvalidArgumentException
Please provide a valid cache path.
```

This is because the `storage/framework` path and subfolders don't exist. You need to create folders and make sure the `www-data` user has read/write/create permissions:

    $ mkdir -p storage/framework/cache
    $ mkdir -p storage/framework/sessions
    $ mkdir -p storage/framework/views
    $ sudo chgrp www-data storage -R
    $ sudo chmod g+rwx storage -R
