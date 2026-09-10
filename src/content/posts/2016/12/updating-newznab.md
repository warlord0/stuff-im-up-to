---
pubDatetime: 2016-12-23T19:28:42Z
title: "Updating Newznab"
tags:
  - "newznab"
  - "Privateer"
  - "usenet"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "As I don't actually run it that often, because it's not everyday I'm looking for a book. Updating it periodically is something I often forget how to do properly."
---
Newznab is a Usenet indexing server. It's a very powerful spider that grabs details of all kinds of Usenet posts in the groups you're interested in. It then indexes and stores them as NZB files so you can download complete releases. [http://www.newznab.com/](http://www.newznab.com/) I've found that running it helps me find books as not many out there seem to interested in indexing the book groups. It's probably not of much interest to you unless you're also looking to index content that isn't common place. Most indexers out there cover Music, TV and Movies - so you'll probably find little use for it. As I don't actually run it that often, because it's not everyday I'm looking for a book. Updating it periodically is something I often forget how to do properly.

    $ cd /var/www/newznab
    $ svn update .
    $ cd misc/update_scripts
    $ php ./update_database_version.php
