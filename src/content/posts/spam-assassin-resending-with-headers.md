---
pubDatetime: 2022-02-26T13:14:20Z
modDatetime: 2022-02-26T13:16:42Z
title: "Spam Assassin Resending With Headers"
tags:
  - "email"
  - "imap"
  - "Linux"
  - "spamassassin"
description: "Following on from Spam Assassin and Bayesian Learning To give our users the ability to forward mail to the spam learning feature, we need to ensure the for"
---
Following on from [Spam Assassin and Bayesian Learning](https://warlord0blog.wordpress.com/2022/02/25/spam-assassin-and-bayesian-learning/)

To give our users the ability to forward mail to the spam learning feature, we need to ensure the forwarded mail gets to `sa-learn` unmolested. That means with the original envelope and headers as it arrived. Normal email forwards remove all the header information that helps spamassassin figure out if it's spam or not.

The documentation shows ways of doing this "[ResendingMailWithHeaders](https://cwiki.apache.org/confluence/display/SPAMASSASSIN/ResendingMailWithHeaders)", but it didn't work for me and didn't really make sense. This is where I found holes in the documentation and missing links to pull mail from IMAP and process it. I found a few clues on what I needed to do, but nothing concrete to solve the problem

This post was my biggest clue of how to do this "[procmail save attachment...](https://unix.stackexchange.com/questions/421433/procmail-save-attachment-with-received-date-in-filename)". What I could then ask users to do was forward the spam email as an attachment - that way all the envelope and headers are preserved inside the attachment. I can then receive the email at the spamassassin server, extract the attachment from the submitted message and process the attachment vi `sa-learn`.

> Using this method also allows users to send many attachments in one submission.

This would require three programs - `fetchmail`, `procmail` and `ripmime`.

**Fetchmail** - a daemon that can connect to a mailbox and fetch messages.

**Procmail** - a mail processor that can handle received messages.

**Ripmime** - a mime processor to extract the attachment from the message.

I created an LDAP user on our systems call `is.spam@domain.tld` to give them a mailbox we could send to.

As the user for spamassassin on Debian is, `debian-spamd` I decided to use the same user to process the submissions. Their home folder is `/var/lib/spamassassin`. We can create the required user config in the same place.

For fetchmail we need the user to have a `.fetchmailrc` file in their home. This tell the daemon how often to poll for messages, what protocol (pop or imap), what account details to use, and how to process the messages.

#### .fetchmail.rc

```
set daemon 60
set logfile .fetchmail.log
set no bouncemail
poll imap.domain.tld proto imap user 'is.spam' pass 'SuperSecretKey' is debian-spamd nokeep ssl

mda "/usr/bin/procmail -d %T"
```

Fetchmail will poll our imap server every 60 seconds, using the user `is.spam` acting for the user `debian-spamd`. It will download the messages and remove them from the server (nokeep), then pass the messages to `/usr/bin/procmail`.

#### .procmail.rc

```
SHELL=/bin/bash
PATH=/usr/sbin:/usr/bin
MAILDIR=$HOME/Maildir/
DEFAULT=$MAILDIR
LOGFILE=$HOME/.procmail.log
LOG=""
VERBOSE=yes
LOGABSTRACT=all

# Feed redirected spam to sa-learn, and also store a copy in a folder called spam.
# This folder of false negatives could be useful if we needed to rebuild our Bayes
# database in the future.

:0
* ^To:is.spam@domain.tld
* ^From: .*@domain.tld

   {
   * < 256000
   :0c: spamassassin.spamlock
   |ripmime -v -i - --syslog --no-nameless --paranoid --overwrite --recursion-max 2 -d /tmp/spam && sa-learn --spam /tmp/spam/ && rm -f /tmp/spam/*

   :0: spamassassin.filelock
   spam
   }

# Mail that is very likely spam (>15) can be saved on the server
# (not forwarded), or by moving the # down one line, even dropped
# on the floor.  Note that dropping mail on the floor is a *bad*
# idea unless you really, really believe no false positives will
# have a score greater than 15.  If you want all mail forwarded,
# just add #'s in front of each of these lines:

:0: spamassassin.filelock2
* ^X-Spam-Level: \*\*\*\*\*\*\*\*\*\*\*\*\*\*\*
#/dev/null
almost-certainly-spam
```

Create these files and a `Maildir/spam` folder in, `/usr/lib/spamassassin` and create a folder `/tmp/spam` to process the attachments from. Make sure you set the permissions for the `.fetchmailrc` and `.procmailrc` files, `Maildir` and `/tmp/spam` folders to `0700` so no other users can read them.

Procmail will check that the message recipient is `is.spam@domain.tld` and that it comes from a mailbox at `@domain.tld`. We don't want to learn from any other source - as that could be detrimental.

When a message meets the criteria, it will be sent through `ripmime`. This extracts top level attachments, not attachments within attachments. I found that `--recursion-max 2` did what I needed. It ignores attachments with no names, like message signatures, saves them in `/tmp/spam` as 7-bit file names (no Chinese or foreign characters). Finally, it sends the whole `/tmp/spam` folder via `sa-learn` to add to our Bayesian spam database, before tidying up.

The messages will be stored in the local users `~/Maildir/spam` folder. This allows administrators access to learned messages, so they could be removed from the database if sent in error.

Now I just need to start the fetchmail daemon as the `debian-spamd` user. To do this and test the system, I can use `sudo`.

```
sudo -u debian-spamd bash
cd ~/
fetchmail
tail -f ~/.fetchmail.log ~/.procmail.log
```

If fetchmail started OK, I should see this in the log.

```
fetchmail: starting fetchmail 6.4.16 daemon
```

If not, I'll see some indication of not being able to connect or logon that I then need to resolve in `.fetchmailrc` or in LDAP or on the IMAP server.

## Testing

Send a spam message as an attachment to the `is.spam@domain.tld` address.

When fetchmail sees it, the log will show:

```
fetchmail: reading message is.spam@imap.domain.tld:11 of 11 (1932 header octets) (7204 body octets) not flushed
```

Then the procmail log will show:

```
procmail: [58747] Fri Feb 25 17:22:38 2022
procmail: Assigning "LOGABSTRACT=all"
procmail: Match on "^To:is.spam@domain.tld"
procmail: Match on "^From: .*@domain.tld"
procmail: Skipped "* < 256000"
procmail: Locking "spamassassin.spamlock"
procmail: Executing "ripmime -v -i - --syslog --no-nameless --paranoid --overwrite --recursion-max 2 -d /tmp/spam && sa-learn --spam /tmp/spam/ && rm -f /tmp/spam/*"
procmail: [58747] Fri Feb 25 17:22:39 2022
procmail: Assigning "LASTFOLDER=ripmime -v -i - --syslog --no-nameless --paranoid --overwrite --recursion-max 2 -d /tmp/spam && sa-learn --spam /tmp/spam/ && rm -f /tmp/spam/*"
From debian-spamd  Fri Feb 25 17:22:38 2022
 Subject: Fwd: #1 eBook Creation Technology (OUT NOW)
  Folder: ripmime -v -i - --syslog --no-nameless --paranoid --overwrit     9145
procmail: Unlocking "spamassassin.spamlock"
procmail: Locking "spamassassin.filelock"
procmail: Assigning "LASTFOLDER=spam/msg.bLgD"
procmail: Opening "spam/msg.bLgD"
procmail: Acquiring kernel-lock
procmail: Unlocking "spamassassin.filelock"
procmail: Notified comsat: "debian-spamd@0:/var/lib/spamassassin/Maildir//spam/msg.bLgD"
From debian-spamd  Fri Feb 25 17:22:38 2022
 Subject: Fwd: #1 eBook Creation Technology (OUT NOW)
  Folder: spam/msg.bLg
```

Good news, we have now learned a new piece of spam into the Bayesian database. You could do further tests by checking that your `nspam` numbers reflect the changes in `sa-learn --dump magic`.

You could also try sending the learned message through `spamc` to see if it gets picked up and adds the **`BAYES_`** header. **REMEMBER**: Your Bayesian DB needs a minimum of 200 spam and 200 ham records for Bayesian to work.

```
$ spamc --headers < mymessage.eml | less

From debian-spamd  Fri Feb 25 17:22:38 2022
Received: from localhost by debian
        with SpamAssassin (version 3.4.6);
        Sat, 26 Feb 2022 12:53:45 +0000
From: redacted <my.user@domain.tld>
To: "is.spam" <is.spam@domain.tld>
Subject: [SPAM] Fwd: #1 eBook Creation Technology (OUT NOW)
Date: Fri, 25 Feb 2022 17:21:51 +0000
Message-Id: <f9202c7b-ad1e-6481-03e1-e586057d3c7e@opusvl.com>
X-Spam-Checker-Version: SpamAssassin 3.4.6 (2021-04-09) on debian
X-Spam-Flag: YES
X-Spam-Level: ******
X-Spam-Status: Yes, score=6.7 required=5.0 tests=ALL_TRUSTED,BAYES_50,
        HTML_IMAGE_ONLY_32,HTML_MESSAGE,HTML_OFF_PAGE,PYZOR_CHECK,
        T_SCC_BODY_TEXT_LINE,URIBL_BLOCKED,URIBL_DBL_SPAM autolearn=no
        autolearn_force=no version=3.4.6
MIME-Version: 1.0
Content-Type: multipart/mixed; boundary="----------=_621A22D9.6723ED1D"
```

## References

[https://unix.stackexchange.com/questions/421433/procmail-save-attachment-with-received-date-in-filename](https://unix.stackexchange.com/questions/421433/procmail-save-attachment-with-received-date-in-filename)

[https://cwiki.apache.org/confluence/display/SPAMASSASSIN/ResendingMailWithHeaders](https://cwiki.apache.org/confluence/display/SPAMASSASSIN/ResendingMailWithHeaders)
