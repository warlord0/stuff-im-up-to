---
pubDatetime: 2018-02-21T14:38:03Z
modDatetime: 2018-02-21T17:48:38Z
title: "The Power of Sphinx"
tags:
  - "database"
  - "Laravel"
  - "Linux"
description: "I've only really used Sphinx as part of a home project with MySQL. But today found that searching for text in 28 million rows in a PostgreSQL table needs s"
---
I've only really used Sphinx as part of a home project with MySQL. But today found that searching for text in 28 million rows in a PostgreSQL table needs something with a bit more performance that the base SQL server. Installing Sphinx on Debian is very straight forward if you want the default repository version and not the leading edge version. I saw no reason why not.

    $ sudo apt-get install sphinxsearch

Now getting it working takes some fettling of the `/etc/sphinxsearch/sphinx.conf` file. It doesn't exist by default so you need to create it either by copying the `sphinx.conf.dist` file or start fresh. You also then need to edit the `/etc/default/sphinxsearch` file and set `START=yes`. What does sphinx offer me? Well indexing a table on a text field where the content would require an SQL query using like with wildcards such as `... where textfield like '%searchstring%';` is not index friendly at all. You could use a full text index, but Sphinx's implementation adds value beyond full text and doesn't have to even be on the server you're indexing. Sphinx indexes the textfield content and offers a search that will return the `id` of matching content, then you can call a query on your table that includes the `id`'s that Sphinx gave you. eg.

    select * from livetable where id in ($sphinxids);

Which is index optimised and will return the results relatively instantly. I think of it as a side query engine. I send a side query to Sphinx, it gives me the id's that match my search. Because Sphinx listens and pretends to be a MySQL server you can use the MySQL client to query it. That client could be any MySQL capable client ODBC, PDO, the mysql CLI.

## sphinx.conf

My `sphinx.conf` is as minimal as I need. First I tell the searchd daemon how to listen for connections and where to put logs and pid.

    searchd
    {
       listen = 9312
       listen = 9306:mysql41
       log = /var/log/sphinxsearch/searchd.log
       query_log =/var/log/sphinxsearch/query.log
       read_timeout = 5 
       client_timeout = 300
       max_children = 30
       persistent_connections_limit = 30
       pid_file = /var/run/sphinxsearch/searchd.pid
    }

Which is pretty much the defaults. Then I create a source - which is the host server for the database and tables I want to index.

    source os
    {
       type = pgsql

       sql_host = localhost
       sql_user = sphinx
       sql_pass = mysupersecretpassword
       sql_db = mypgdatabase
       sql_port = 5432

       sql_query = select id, textfield from schema.table

       sql_field_string = textfield

    }

So this will query all of my records from a PostgreSQL database `schema.table` and return `id` and `textfield` from which the string field I want to index is `textfield`. Then I tell it what indexes I want to create

    index os_textfield1
    {
       source = os
       path = /home/sphinxsearch/data/os_textfield1
       min_word_len = 3
    }

Which uses the source named `os` for words with at least 3 characters. I created a home folder for `sphinxsearch` and put the indexes under there. You may chose where to put them, but make sure the `sphinxsearch` user has permissions! So from the huge `.dist` version of config that looks daunting, I've shrunk it down to only what I need above.

## Indexing

> If data in your source tables changes frequently this wont be reflected in your Sphinx searches until the next time it runs the indexer. So the Sphinx results are only as up to date as the last time you indexed it.

With a live and working config you can now create your indexes by using the indexer.

    $ sudo -u sphinxsearch indexer --all

Specify the user in the sudo or the created index file ownership will be wrong for the service! After the indexes are created you can start the sphinxsearch daemon.

    $ sudo systemctl start sphinxsearch

For testing I like to spin up the searchd daemon manually to see it run.

    $ sudo -u sphinxsearch searchd

    Sphinx 2.2.11-id64-release (95ae9a6)
    Copyright (c) 2001-2016, Andrew Aksyonoff
    Copyright (c) 2008-2016, Sphinx Technologies Inc (http://sphinxsearch.com)

    using config file '/etc/sphinxsearch/sphinx.conf'...
    listening on all interfaces, port=9312
    listening on all interfaces, port=9306
    precaching index 'os_textfield1'
    precached 1 indexes in 0.790 sec

Then stop it using

    $ sudo -u sphinxsearch searchd --stop

    Sphinx 2.2.11-id64-release (95ae9a6)
    Copyright (c) 2001-2016, Andrew Aksyonoff
    Copyright (c) 2008-2016, Sphinx Technologies Inc (http://sphinxsearch.com)

    using config file '/etc/sphinxsearch/sphinx.conf'...
    stop: successfully sent SIGTERM to pid 32410

If the daemon is already running the indexer will fail unless you tell it you want it to rotate the indexes. This causes indexer to carry on and then tell the `searchd` daemon when it's finished that there are new indexes and it should swap to them. This is the command you need to run to re-index and rotate. You should probably schedule this for as frequent as you need to update your search engine. Even on my PC 28 million rows took less than 5 minutes to re-index. You just need to figure out a satisfactory frequency to do it.

    $ sudo -u sphinxsearch indexer --all --rotate

## Testing

Before developing application code I like to test that I can use the Sphinx index for searching. For this just make sure you have the `mysql-client` installed.

    $ sudo apt-get install mysql-client

Then you can connect to Sphinx - no user or password required.

    $ mysql --port=9306 --protocol=tcp

    mysql> show tables;
    +---------------+-------+
    | Index         | Type  |
    +---------------+-------+
    | os_textfield1 | local |
    +---------------+-------+
    1 row in set (0.00 sec)

Test the search using a match query.

    mysql> select * from os_textfield1 where match('@textfield DONKEY');

This will return the columns `id` and `textfield` from my index `os_textfield1` where it contains `DONKEY`. So you see it works pretty much like MySQL and now you can use it in your projects.

## Laravel

There's a really helpful project on Github that enabled me to make great use of Sphinx. Made coding with in my controllers so much easier. [https://github.com/sngrl/sphinxsearch](https://github.com/sngrl/sphinxsearch)

### References

[https://anadea.info/blog/postgresql-and-sphinx-search-seamless-integration](https://anadea.info/blog/postgresql-and-sphinx-search-seamless-integration)
