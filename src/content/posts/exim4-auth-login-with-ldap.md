---
pubDatetime: 2022-02-23T20:15:25Z
modDatetime: 2022-03-01T11:36:16Z
title: "Exim4 AUTH LOGIN with LDAP"
tags:
  - "email"
  - "exim4"
  - "Linux"
  - "smtp"
  - "Windows"
description: "This was a cause for smashing my head against the wall today. I configured Exim4 with LDAP auth and tested it with Thunderbird and a couple of Mac clients"
---
This was a cause for smashing my head against the wall today.

I configured [Exim4 with LDAP](https://warlord0blog.wordpress.com/2022/02/19/exim4-ldap-auth/) auth and tested it with Thunderbird and a couple of Mac clients - I didn't expect Windows/Office to be the problem child. One of our users, trying to use Outlook, was getting refusals to login. This made no sense as all the other users are logging in just fine. Looking at the logs, the issue wasn't obvious.

I got the user to install Thunderbird, and it logged in just fine.

Time to try the SMTP server out from a text console.

First get your username and password converted to base64:

```
$ echo my.user | base64         
bXkudXNlcgo=

$ echo mypasswd | base64
bXlwYXNzd2QK
```

Use `openssl` to get us connected to the server and handle the `STARTTLS` bits for us:

```
openssl s_client -starttls smtp -crlf -connect smtp.domain.tld:587
```

Use SMTP commands to authenticate by submitting your base64 username and password to the 334 responses (username first, password second):

```
250 HELP
ehlo bert
250-smtp.domain.tld Hello bert [127.0.0.1]
250-SIZE 52428800
250-8BITMIME
250-PIPELINING
250-PIPE_CONNECT
250-AUTH PLAIN LOGIN
250-CHUNKING
250-PRDR
250 HELP
auth login
334 4oCcVXNlcm5hbWU6
bXkudXNlcgo=
334 UGFzc3dvcmQ64oCd
bXlwYXNzd2QK
535 Incorrect authentication data
quit
221 smtp.domain.tld closing connection
closed
```

Looking in `/var/log/exim4/mainlog` I see the following:

```
535 Incorrect authentication data (set_id=my.user\n)
```

The helpful part was seeing the `\n` on the end of the username. That should not be there. After ramping up the exim logging, by adding `-d+auth` to the `/etc/defaults/exim4` `SMTPLISTENEROPTIONS`, I see the authentication taking place, and took some time to spot the issue.

I see the LDAP query call, and it has the `\n` in the query string as `%0A` - the hex representation of the newline character (ASCII 10).

```
database lookup required for ldap://ldap/ou=People,dc=domain,dc=tld??sub?(uid=my.user%0A)
```

What a mess. How am I to fix that? The config uses `$auth1` and `$auth2`, which are provided by the `plaintext` driver. Why is it including the `\n`? My only option is to remove it myself and log this as a bug with the Exim4 team.

I have to use an exim string function to replace the `\n`, by changing the usage of `$auth1` and `$auth2` to this:

```
${sg{$auth1}{\n}{}}
```

This does a search and replace, using a perl style regex like this `s/\n//g` - search replace with option global.

Now my `login:` section looks like this:

```
login:
  driver = plaintext
  public_name = LOGIN
  server_condition = ${if and{{ !eq{}{$auth1} }\
    {!eq{}{${lookup ldapdn{ldap://ldap/dc=domain,dc=tld??sub?(&(cn=access-service-imap)(memberUID=${quote_ldap:${sg{$auth1}{\n}{}}}))}}} } \
    { \
    ldapauth{\
      user="${quote_ldap:${lookup ldapdn{ldap://ldap/ou=People,dc=domain,dc=tld??sub?(uid=${quote_ldap:${sg{$auth1}{\n}{}}})}}}" \
      pass=${quote:${sg{$auth2}{\n}{}}} \
      ldap://ldap/} }} \
    }
  server_set_id = ${sg{$auth1}{\n}{}}
  server_prompts = Username:: : Password::
```

This is frustrating because the `plain:` section doesn't require this special treatment.

We try the login using `openssl` and now see that it succeeds!

```
235 Authentication succeeded
```
