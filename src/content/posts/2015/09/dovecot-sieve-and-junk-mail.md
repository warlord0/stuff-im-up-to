---
pubDatetime: 2015-09-15T09:08:37Z
modDatetime: 2016-09-19T17:34:50Z
title: "Dovecot Sieve and Junk Mail"
tags:
  - "dovecot"
  - "imap"
  - "Linux"
heroImage: "/blog-media/2016/09/debian-logo-1.png"
description: "This is a useful addition to Dovecot and will pass messages marked as spam directly into a Junk mail folder. Trouble is when you're working with the Outloo"
---
This is a useful addition to Dovecot and will pass messages marked as spam directly into a Junk mail folder. Trouble is when you're working with the Outlook IMAP client it structures folders a little differently. So in order to put it into the correct folder a few changes to the Dovecot namespace is required. Specifically MS uses a dot in the folder name eg. ".Junk E-mail" and ".Trash" So to cater for this here's the changes made to activate dovecot-sieve and the mailbox folder names. Changes in **/etc/dovecot/conf.d/15-mailbox.conf**

    mailbox ".Junk E-mail" {
      special_use = \Junk
    }
    mailbox ".Trash" {
      special_use = \Trash
    }

Changes in **/etc/dovecot/conf.d/90-sieve.conf**

    plugin {
      sieve = ~/.dovecot.sieve
      sieve_dir = ~/sieve
      sieve_global_dir = /var/lib/dovecot/sieve/global/
      sieve_global_path = /var/lib/dovecot/sieve/default.sieve
    }

Enable the sieve plugin by adding it into the lda config. Changes in **/etc/dovecot/conf.d/15-lda.conf**

    protocol lda {
      # Space separated list of plugins to load (default is global mail_plugins).
      #mail_plugins = $mail_plugins
      mail_plugins = $mail_plugins sieve
    }

Create the sieve rule file to actually pass the messages to Junk if they are spam. Note the deliberate missing "." in the fileinto line. File: **/var/lib/dovecot/sieve/default.sieve**

    require "fileinto";
      if exists "X-Spam-Flag" {
              if header :contains "X-Spam-Flag" "NO" {
              } else {
              fileinto "Junk E-mail";
              stop;
              }
      }

Getting it to run is now a little bit of an exercise. The sieve file needs to be compiled and the vmail user/group needs to have access to the path or it won't run. So make sure you chgrp/chmod the /var/lib/dovecot path and subfolders as necessary for the vmail user/group. Compile the sieve using

    # sievec /var/lib/dovecot/sieve/default.sieve
