---
pubDatetime: 2017-11-15T08:34:39Z
modDatetime: 2017-11-15T09:16:14Z
title: "Horizon View Client v4.6.0"
tags:
  - "horizon"
  - "Linux"
  - "vmware"
heroImage: "/blog-media/2016/10/vmware-logo-eps-vector-image-800x533-e1476948729563.png"
description: "I decided to upgrade my VMware Horizon View client today. It still has the same kind of issues as detailed here: https://warlord0blog.wordpress.com/2016/10"
---
I decided to upgrade my VMware Horizon View client today. It still has the same kind of issues as detailed here: [https://warlord0blog.wordpress.com/2016/10/21/vmware-horizon-client-for-linux/](https://warlord0blog.wordpress.com/2016/10/21/vmware-horizon-client-for-linux/) This time around my problems were with libgstreamer components. Even though I ensured they were installed the libraries were a different version that required by the client. Specifically required:

- libgstapp-0.10.so.0
- libgstbase-0.10.so.0
- libgstreamer-0.10.so.0

On my Debian Stretch install I had 1.0 versions. So a quick fix by linking these made the scan issues go away.

    $ cd /usr/lib/x86_64-linux-gnu
    $ sudo ln -s libgstapp-1.0.so.0 libgstapp-0.10.so.0
    $ sudo ln -s libgstbase-1.0.so.0 libgstbase-0.10.so.0
    $ sudo ln -s libgstreamer-1.0.so.0 libgstreamer-0.10.so.0

You can also use `ldd` to see what's needed.

    $ ldd /usr/lib/vmware/view/bin/vmware-view                                   
        linux-vdso.so.1 (0x00007ffc525eb000)
        libatk-1.0.so.0 => /usr/lib/x86_64-linux-gnu/libatk-1.0.so.0 (0x00007f0b9d5cd000)
        libgdk_pixbuf-2.0.so.0 => /usr/lib/x86_64-linux-gnu/libgdk_pixbuf-2.0.so.0 (0x00007f0b9d3a9000)
        libgtk-x11-2.0.so.0 => /usr/lib/x86_64-linux-gnu/libgtk-x11-2.0.so.0 (0x00007f0b9cd60000)
        libgdk-x11-2.0.so.0 => /usr/lib/x86_64-linux-gnu/libgdk-x11-2.0.so.0 (0x00007f0b9caab000)
        libgio-2.0.so.0 => /usr/lib/x86_64-linux-gnu/libgio-2.0.so.0 (0x00007f0b9c715000)
        libgthread-2.0.so.0 => /usr/lib/x86_64-linux-gnu/libgthread-2.0.so.0 (0x00007f0b9c513000)
        libpixman-1.so.0 => /usr/lib/x86_64-linux-gnu/libpixman-1.so.0 (0x00007f0b9c26c000)
        libpng12.so.0 => /lib/x86_64-linux-gnu/libpng12.so.0 (0x00007f0b9c045000)
        libXss.so.1 => /usr/lib/x86_64-linux-gnu/libXss.so.1 (0x00007f0b9be42000)
        libudev.so.0 => /lib/x86_64-linux-gnu/libudev.so.0 (0x00007f0b9d9cf000)
        libglib-2.0.so.0 => /lib/x86_64-linux-gnu/libglib-2.0.so.0 (0x00007f0b9bb2e000)
        libgobject-2.0.so.0 => /usr/lib/x86_64-linux-gnu/libgobject-2.0.so.0 (0x00007f0b9b8db000)
        libgmodule-2.0.so.0 => /usr/lib/x86_64-linux-gnu/libgmodule-2.0.so.0 (0x00007f0b9b6d7000)
        libX11.so.6 => /usr/lib/x86_64-linux-gnu/libX11.so.6 (0x00007f0b9b397000)
        libXinerama.so.1 => /usr/lib/x86_64-linux-gnu/libXinerama.so.1 (0x00007f0b9b194000)
        librt.so.1 => /lib/x86_64-linux-gnu/librt.so.1 (0x00007f0b9af8c000)
        libdl.so.2 => /lib/x86_64-linux-gnu/libdl.so.2 (0x00007f0b9ad88000)
        libssl.so.1.0.2 => /usr/lib/x86_64-linux-gnu/libssl.so.1.0.2 (0x00007f0b9ab1f000)
        libcrypto.so.1.0.2 => /usr/lib/x86_64-linux-gnu/libcrypto.so.1.0.2 (0x00007f0b9a6bb000)
        libxml2.so.2 => /usr/lib/x86_64-linux-gnu/libxml2.so.2 (0x00007f0b9a300000)
        libz.so.1 => /lib/x86_64-linux-gnu/libz.so.1 (0x00007f0b9a0e6000)
        libstdc++.so.6 => /usr/lib/x86_64-linux-gnu/libstdc++.so.6 (0x00007f0b99d64000)
        libm.so.6 => /lib/x86_64-linux-gnu/libm.so.6 (0x00007f0b99a60000)
        libgcc_s.so.1 => /lib/x86_64-linux-gnu/libgcc_s.so.1 (0x00007f0b99849000)
        libpthread.so.0 => /lib/x86_64-linux-gnu/libpthread.so.0 (0x00007f0b9962c000)
        libc.so.6 => /lib/x86_64-linux-gnu/libc.so.6 (0x00007f0b9928d000)
        libpangocairo-1.0.so.0 => /usr/lib/x86_64-linux-gnu/libpangocairo-1.0.so.0 (0x00007f0b99080000)
        libcairo.so.2 => /usr/lib/x86_64-linux-gnu/libcairo.so.2 (0x00007f0b98d6c000)
        libpango-1.0.so.0 => /usr/lib/x86_64-linux-gnu/libpango-1.0.so.0 (0x00007f0b98b20000)
        libpng16.so.16 => /usr/lib/x86_64-linux-gnu/libpng16.so.16 (0x00007f0b988ed000)
        libXcomposite.so.1 => /usr/lib/x86_64-linux-gnu/libXcomposite.so.1 (0x00007f0b986ea000)
        libXdamage.so.1 => /usr/lib/x86_64-linux-gnu/libXdamage.so.1 (0x00007f0b984e7000)
        libXfixes.so.3 => /usr/lib/x86_64-linux-gnu/libXfixes.so.3 (0x00007f0b982e1000)
        libpangoft2-1.0.so.0 => /usr/lib/x86_64-linux-gnu/libpangoft2-1.0.so.0 (0x00007f0b980cb000)
        libfontconfig.so.1 => /usr/lib/x86_64-linux-gnu/libfontconfig.so.1 (0x00007f0b97e8d000)
        libfreetype.so.6 => /usr/lib/x86_64-linux-gnu/libfreetype.so.6 (0x00007f0b97bde000)
        libXrender.so.1 => /usr/lib/x86_64-linux-gnu/libXrender.so.1 (0x00007f0b979d4000)
        libXi.so.6 => /usr/lib/x86_64-linux-gnu/libXi.so.6 (0x00007f0b977c4000)
        libXrandr.so.2 => /usr/lib/x86_64-linux-gnu/libXrandr.so.2 (0x00007f0b975b9000)
        libXcursor.so.1 => /usr/lib/x86_64-linux-gnu/libXcursor.so.1 (0x00007f0b973ae000)
        libXext.so.6 => /usr/lib/x86_64-linux-gnu/libXext.so.6 (0x00007f0b9719c000)
        libselinux.so.1 => /lib/x86_64-linux-gnu/libselinux.so.1 (0x00007f0b96f74000)
        libresolv.so.2 => /lib/x86_64-linux-gnu/libresolv.so.2 (0x00007f0b96d5d000)
        libmount.so.1 => /lib/x86_64-linux-gnu/libmount.so.1 (0x00007f0b96b0f000)
        /lib64/ld-linux-x86-64.so.2 (0x00007f0b9d7f3000)
        libpcre.so.3 => /lib/x86_64-linux-gnu/libpcre.so.3 (0x00007f0b9689c000)
        libffi.so.6 => /usr/lib/x86_64-linux-gnu/libffi.so.6 (0x00007f0b96693000)
        libxcb.so.1 => /usr/lib/x86_64-linux-gnu/libxcb.so.1 (0x00007f0b9646b000)
        libicui18n.so.57 => /usr/lib/x86_64-linux-gnu/libicui18n.so.57 (0x00007f0b95ff1000)
        libicuuc.so.57 => /usr/lib/x86_64-linux-gnu/libicuuc.so.57 (0x00007f0b95c49000)
        libicudata.so.57 => /usr/lib/x86_64-linux-gnu/libicudata.so.57 (0x00007f0b941cc000)
        liblzma.so.5 => /lib/x86_64-linux-gnu/liblzma.so.5 (0x00007f0b93fa6000)
        libxcb-shm.so.0 => /usr/lib/x86_64-linux-gnu/libxcb-shm.so.0 (0x00007f0b93da2000)
        libxcb-render.so.0 => /usr/lib/x86_64-linux-gnu/libxcb-render.so.0 (0x00007f0b93b94000)
        libthai.so.0 => /usr/lib/x86_64-linux-gnu/libthai.so.0 (0x00007f0b9398a000)
        libharfbuzz.so.0 => /usr/lib/x86_64-linux-gnu/libharfbuzz.so.0 (0x00007f0b936f5000)
        libexpat.so.1 => /lib/x86_64-linux-gnu/libexpat.so.1 (0x00007f0b934cb000)
        libblkid.so.1 => /lib/x86_64-linux-gnu/libblkid.so.1 (0x00007f0b93285000)
        libXau.so.6 => /usr/lib/x86_64-linux-gnu/libXau.so.6 (0x00007f0b93081000)
        libXdmcp.so.6 => /usr/lib/x86_64-linux-gnu/libXdmcp.so.6 (0x00007f0b92e7b000)
        libdatrie.so.1 => /usr/lib/x86_64-linux-gnu/libdatrie.so.1 (0x00007f0b92c73000)
        libgraphite2.so.3 => /usr/lib/x86_64-linux-gnu/libgraphite2.so.3 (0x00007f0b92a46000)
        libuuid.so.1 => /lib/x86_64-linux-gnu/libuuid.so.1 (0x00007f0b92841000)
        libbsd.so.0 => /lib/x86_64-linux-gnu/libbsd.so.0 (0x00007f0b9262b000)
