---
pubDatetime: 2019-07-12T19:05:51Z
modDatetime: 2019-07-12T22:29:50Z
title: "[unixODBC][Driver Manager]Can’t open lib : file not found"
tags:
  - "Laravel"
  - "Linux"
  - "mssql"
  - "php"
heroImage: "/blog-media/2016/10/mssql_logo.png"
description: "I have no idea how we came up against this issue on one of the development images. I'd prepared it all up to the point of delivering php. After following m"
---
I have no idea how we came up against this issue on one of the development images. I'd prepared it all up to the point of delivering php. After following my instructions to install the MS SQL drivers everything looked to go well, but when serving up our Laravel project in artisan PHP came up with this error message.

> \[unixODBC\]\[Driver Manager\]Can’t open lib ‘/opt/microsoft/msodbcsql17/lib64/libmsodbcsql-17.3.so.1.1’ : file not found

Now we have seen this before and it related to [locale's](https://warlord0blog.wordpress.com/2017/12/12/php7-0-microsoft-sql-driver-debian-stretch/) so we tried that fix and still didn't get it to work.

Trawling the internet I came across something pointed us to use `ldd` to look at the `.so` file and check out it's dependencies.

```
$ ldd /opt/microsoft/msodbcsql17/lib64/libmsodbcsql-17.3.so.1.1                                           
        linux-vdso.so.1 (0x00007fffbb7ed000)
        libdl.so.2 => /lib/x86_64-linux-gnu/libdl.so.2 (0x00007f73cd4a8000)
        librt.so.1 => /lib/x86_64-linux-gnu/librt.so.1 (0x00007f73cd49e000)
        libodbcinst.so.2 => /usr/lib/x86_64-linux-gnu/libodbcinst.so.2 (0x00007f73cd283000)
        libcrypto.so.1.0.2 => not found
        libkrb5.so.3 => /usr/lib/x86_64-linux-gnu/libkrb5.so.3 (0x00007f73ccd3d000)
        libgssapi_krb5.so.2 => /usr/lib/x86_64-linux-gnu/libgssapi_krb5.so.2 (0x00007f73cccf0000)
        libssl.so.1.0.2 => not found
        libuuid.so.1 => /lib/x86_64-linux-gnu/libuuid.so.1 (0x00007f73cca7c000)
        libstdc++.so.6 => /usr/lib/x86_64-linux-gnu/libstdc++.so.6 (0x00007f73cc8f8000)
        libm.so.6 => /lib/x86_64-linux-gnu/libm.so.6 (0x00007f73cc775000)
        libgcc_s.so.1 => /lib/x86_64-linux-gnu/libgcc_s.so.1 (0x00007f73cc75b000)
        libpthread.so.0 => /lib/x86_64-linux-gnu/libpthread.so.0 (0x00007f73cc73a000)
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f73cc577000)
        /lib64/ld-linux-x86-64.so.2 (0x00007f73cd8ca000)
        libk5crypto.so.3 => /usr/lib/x86_64-linux-gnu/libk5crypto.so.3 (0x00007f73cc543000)
        libcom_err.so.2 => /lib/x86_64-linux-gnu/libcom_err.so.2 (0x00007f73cc53d000)
        libkrb5support.so.0 => /usr/lib/x86_64-linux-gnu/libkrb5support.so.0 (0x00007f73cc52e000)
        libkeyutils.so.1 => /lib/x86_64-linux-gnu/libkeyutils.so.1 (0x00007f73cc527000)
        libresolv.so.2 => /lib/x86_64-linux-gnu/libresolv.so.2 (0x00007f73cc50d000)
```

It looks like we managed somehow to install the `msodbcsql` drivers without having the required pre-requisites to meet these dependencies! I imagined that installing `msodbcsql` would have complained at install or would have just downloaded and installed the dependencies - I guess not.

After a bit of wrangling it turns out the only thing missing is `libssl-dev`. After uninstalling `msodbcsql`, `mssql-tools` and `unixodbc-dev`. Removing the `pecl` modules. Then installing `libssl-dev` and redoing the whole `msodbcsql` install and `pecl install` again things finally worked.

```
$ sudo pecl uninstall sqlsrv
$ sudo pecl uninstall pdo_sqlsrv
$ sudo apt purge msodbcsql mssql-tools unixodbc-dev
```

```
$ sudo apt install libssl-dev
$ sudo apt install msodbcsql mssql-tools unixodbc-dev 
$ sudo pecl install sqlsrv
$ sudo pecl install pdo_sqlsrv
```
