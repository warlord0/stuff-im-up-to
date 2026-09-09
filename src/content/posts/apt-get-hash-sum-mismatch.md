---
pubDatetime: 2017-06-30T06:56:13Z
title: "apt-get - Hash Sum mismatch"
tags:
  - "debian"
  - "Linux"
description: "I tried to run some updates on my workstation today and it failed with a Hash Sum mismatch. $ sudo apt-get update W: Failed to fetch http://www.deb-multime"
---
I tried to run some updates on my workstation today and it failed with a Hash Sum mismatch.

    $ sudo apt-get update

    W: Failed to fetch http://www.deb-multimedia.org/dists/jessie/main/i18n/Translation-en Hash Sum mismatch

    W: Failed to fetch http://www.deb-multimedia.org/dists/jessie/non-free/i18n/Translation-en Hash Sum mismatch

    E: Some index files failed to download. They have been ignored, or old ones used instead.

Not quite sure what the problem is but it looks like maybe a file was corrupted or didn't download correctly. A quick look in the `/var/lib/apt/lists` folder showed some FAILED files.

    $ ls /var/lib/apt/lists/*
    ...
    www.deb-multimedia.org_dists_jessie_InRelease.reverify
    www.deb-multimedia.org_dists_jessie_main_binary-amd64_Packages.xz
    www.deb-multimedia.org_dists_jessie_main_binary-i386_Packages.xz
    www.deb-multimedia.org_dists_jessie_main_i18n_Translation-en.bz2
    www.deb-multimedia.org_dists_jessie_main_i18n_Translation-en.FAILED
    www.deb-multimedia.org_dists_jessie_main_source_Sources.xz
    www.deb-multimedia.org_dists_jessie_non-free_binary-amd64_Packages.xz
    www.deb-multimedia.org_dists_jessie_non-free_binary-i386_Packages.xz
    www.deb-multimedia.org_dists_jessie_non-free_i18n_Translation-en.bz2
    www.deb-multimedia.org_dists_jessie_non-free_i18n_Translation-en.FAILED
    www.deb-multimedia.org_dists_jessie_non-free_source_Sources.xz

Rather than remove and redownload all the lists again I just deleted those related to the FAILED files and re-ran the `apt-get update`.

    $ sudo rm -f /var/lib/apt/lists/www.deb-multimedia.org_dists_jessie*
