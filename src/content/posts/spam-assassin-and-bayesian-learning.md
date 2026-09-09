---
pubDatetime: 2022-02-25T19:57:52Z
modDatetime: 2022-02-27T14:25:12Z
title: "Spam Assassin and Bayesian Learning"
tags:
  - "email"
  - "Linux"
  - "spamassassin"
description: "Spam Assassin is the good old go to for filtering emails, but I wanted to upgrade our existing system and add into it the ability for users to send their r"
---
Spam Assassin is the good old go to for filtering emails, but I wanted to upgrade our existing system and add into it the ability for users to send their received spam to add to the learning.

I found plenty of documentation, but much of it with missing links or no longer valid. My next course was to figure it out for myself. Trouble is, this is a bigger learning curve for me than Spam Assassin! This is the first part that deals with setting up the Bayesian learning, then we can move onto using `fetchmail`, `procmail` and `ripmime` to handle submissions.

To start with, I built a Debian server and installed `spamassassin` and the `spamc` client. After following the standard documentation for configuring it to process requests, I set it up to listen on TCP port 783, so I could send spam check requests from my mail systems.

As with most config I do these days, it's all driven by Ansible. The files and configs are all delivered through a playbook.

Enable spamassassin and set some basic options.

#### /etc/default/spamassassin

```
ENABLED=1
CRON=1

OPTIONS="-i 0.0.0.0 -p 783 --ipv4-only --create-prefs --max-children 2 --username debian-spamd --allowed-ips=127.0.0.1,192.168.122.1"
```

## Redis

For the Bayesian DB I'm going to use redis, so install `redis` and `redis-server`. There's a useful page on how to enable redis [here](https://cwiki.apache.org/confluence/display/SPAMASSASSIN/SiteWideBayesSetup), but the most useful part is the link to the example config files [here](http://svn.apache.org/repos/asf/spamassassin/trunk/contrib/HOWTO.Bayes-Redis/).

Put simply paste the `bayes_redis.cf` file into `/etc/spamassassin` and change the dsn to match your usage.

```
bayes_sql_dsn  server=127.0.0.1:6379;database=0
```

The above will probably work just fine if you're using redis on the same machine. We could secure it with a password, but it's already limited to only listening on 127.0.0.1, meaning only this machine can get to it.

If you restart spamassassin, check syslog to make sure it connected to redis ok. If you notice starting spamassassin took a while, check the log and the connection to redis. Use the `redis-cli` to prove it works.

```
$ redis-cli             
127.0.0.1:6379>
```

If you see the `127.0.0.1:6379>` prompt, redis works - check your `bayes_redis.cf` for a typo.

## Using sa-learn

Check to see if we have any learned spam, we should not have.

```
$ sa-learn --dump magic

0.000          0          3          0  non-token data: bayes db version
0.000          0          0          0  non-token data: nspam
0.000          0          0          0  non-token data: nham
0.000          0          0          0  non-token data: ntokens
0.000          0          0          0  non-token data: oldest atime
0.000          0          0          0  non-token data: newest atime
0.000          0          0          0  non-token data: last journal sync atime
0.000          0          0          0  non-token data: last expiry atime
0.000          0          0          0  non-token data: last expire atime delta
0.000          0          0          0  non-token data: last expire reduction count
```

What you need now are some spam email files to learn from. Copy the raw message from your Thunderbird spam folder using CTRL+U and copy the whole message with headers. Paste it into a file on the server, and let's teach spamassassin about spam.

```
sa-learn --spam myfile
```

Then repeat the `--dump magic` and you should see you have 1 `nspam` record. We can also verify that it's in redis using:

```
redis-cli keys '*'
  1) "w:\x98\x96\xa9\xa1,"
```

Don't worry about what it means beyond the fact that you have seen a record get added to your Bayesian spam database.

> One important fact I missed was that in order for the Bayesian spam checking to become active, you must have a **MINIMUM** of 200 records of learned HAM and SPAM. If you haven't got that far, then you won't see any **BAYE\_** entries in a message `X-Spam-Status` header.

Eg.

```
X-Spam-Status: Yes, score=5.9 required=5.0 tests=ALL_TRUSTED,BAYES_50,      
LONGWORDS,RAZOR2_CF_RANGE_51_100,RAZOR2_CHECK,T_SCC_BODY_TEXT_LINE,
URIBL_ABUSE_SURBL,URIBL_BLOCKED autolearn=no autolearn_force=no
version=3.4.6
```

To force the issue along I used my `~/Maildir/cur` folder to copying it to a folder on the server and scanning it as **ham** with:

```
sa-learn --ham /tmp/Maildir/cur
```

Then, looking at, `--dump magic` I see a number greater than 200 for `nham`.

Similarly, you could do the same for the spam folder - but I found a link to this - [http://untroubled.org/spam/](http://untroubled.org/spam/), I grabbed the 2022 files and used some of the contents to scan as spam.

Now I have way more than 200 ham and spam's learnt in my db.

```
$ sa-learn --dump magic                     
0.000          0          3          0  non-token data: bayes db version
0.000          0       1758          0  non-token data: nspam
0.000          0        323          0  non-token data: nham
```

## Using the spamc client

You might want to install `spamc` on your own machine and submit spam checks remotely. Doing this will at least show you can check from another system before moving onto your mail servers. One thing you'll need to check is that you included your IP address in the default file above in a comma separated list for `---allowed-ips=127.0.0.1,[my ip address]`. If not, you will get scores of only 0/0 because it cannot connect.

Take your piece of spam as a file and pass it to the `spamc` client to check using:

```
$ spamc -r < msg.vSAE 

Spam detection software, running on the system "debian",
has identified this incoming email as possible spam.  The original
message has been attached to this so you can view it or label
similar future email.  If you have any questions, see
the administrator of that system for details.

Content preview:  -------- Forwarded Message -------- Subject: #1 Popular Health
   Supplement actually triggers Diabetes! Date: Fri, 25 Feb 2022 05:00:19 -0500
   From: Omega <omega@easycansvasprinsts.us> Reply-To: Omega <o [...] 

Content analysis details:   (5.9 points, 5.0 required)

 pts rule name              description
---- ---------------------- --------------------------------------------------
 1.2 URIBL_ABUSE_SURBL      Contains an URL listed in the ABUSE SURBL
                            blocklist
                            [URIs: easycansvasprinsts.us]
 0.0 URIBL_BLOCKED          ADMINISTRATOR NOTICE: The query to URIBL was
                            blocked.  See
                            http://wiki.apache.org/spamassassin/DnsBlocklists#dnsbl-block
                             for more information.
                            [URIs: easycansvasprinsts.us]
-1.0 ALL_TRUSTED            Passed through trusted hosts only via SMTP
 0.8 BAYES_50               BODY: Bayes spam probability is 40 to 60%
                            [score: 0.5000]
 0.9 RAZOR2_CHECK           Listed in Razor2 (http://razor.sf.net/)
 1.9 RAZOR2_CF_RANGE_51_100 Razor2 gives confidence level above 50%
                            [cf: 100]
-0.0 T_SCC_BODY_TEXT_LINE   No description available.
 2.0 LONGWORDS              Long string of long words
```

You can get shorter, simpler responses with:

```
$ spamc -c < msg.vSAE 
5.9/5.0
```

And watch what happens when a server adds the headers and changes the subject (if you have opted to do that).

```
$ spamc --headers < msg.vSAE | head -n20

From redacted  Fri Feb 25 10:14:17 2022
Received: from localhost by debian
    with SpamAssassin (version 3.4.6);
    Fri, 25 Feb 2022 19:42:38 +0000
From: redacted <my.email@domain.tld>
To: Is Spam <is.spam@domain.tld>
Subject: [SPAM] Fwd: #1 Popular Health Supplement actually triggers Diabetes!
Date: Fri, 25 Feb 2022 10:00:20 +0000
Message-Id: <b6075793-d3ae-9a39-50a6-751b708aa0b2@domain.tld>
X-Spam-Checker-Version: SpamAssassin 3.4.6 (2021-04-09) on debian
X-Spam-Flag: YES
X-Spam-Level: *****
X-Spam-Status: Yes, score=5.9 required=5.0 tests=ALL_TRUSTED,BAYES_50,
    LONGWORDS,RAZOR2_CF_RANGE_51_100,RAZOR2_CHECK,T_SCC_BODY_TEXT_LINE,
    URIBL_ABUSE_SURBL,URIBL_BLOCKED autolearn=no autolearn_force=no
    version=3.4.6
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="----------=_6219312E.BD749D62"

This is an OpenPGP/MIME signed message (RFC 4880 and 3156)
```

If all is well up to now, you can now go onto actually adding your mail server to the list of `--allowed-ips` and adding in the required config on the mail server, be it exim4 or postfix.

## Shortcut Plugin

If you've got your Bayesian DB working as it should, then you might consider enabling the shortcut plugin. This will skip all other checks if the Bayesian score is 99-100% and save some CPU processing. After all, if you've decided it's spam, there's no need to continue testing any more to find out that it's spam.

Enable the plugin by editing `/etc/spamassassin/v320.pre` and uncommenting the line:

```
loadplugin Mail::SpamAssassin::Plugin::Shortcircuit
```

Then edit your `local.cf` file and uncomment the following lines and any others that you might like to cause a shortcut:

```
shortcircuit BAYES_99                spam
shortcircuit BAYES_00                ham
```

Next we'll look at allowing users to submit spam to teach spamassassin about things it missed - See [Spam Assassin Resending With Headers](https://warlord0blog.wordpress.com/2022/02/26/spam-assassin-resending-with-headers/).
