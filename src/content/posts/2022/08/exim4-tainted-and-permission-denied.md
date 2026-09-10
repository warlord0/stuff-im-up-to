---
pubDatetime: 2022-08-22T20:01:56Z
modDatetime: 2022-08-24T11:15:31Z
title: "Exim4 Tainted and Permission Denied"
tags:
  - "exim4"
  - "Linux"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "Talk about driving me crazy. We had error messages in our logs claiming that the vacation transport - or out of office auto replies didn't work because of"
---
Talk about driving me crazy. We had error messages in our logs claiming that the vacation transport - or out of office auto replies didn't work because of permission errors.

After changing folder and file permission to give full read, write, execute (0777) to everyone, it still generated errors.

```
dominic@domain.tld R=uservacation T=vacation_transport defer (13): Permission denied: Tainted '/home/dominic/.email-away.once.db' (once file for vacation_transport transport) not permitted
```

But this was not what the error meant.

In Exim4 4.94 they introduced tainted variables. These are variables that come directly from untrusted input. Reading Chapter 11, Section 9 explains it best:

[Exim4 - Chapter 11, Section 9 - Expansion variables](https://www.exim.org/exim-html-current/doc/html/spec_html/ch-string_expansions.html#SECTexpvar)

> Variables marked as tainted are likely to carry data supplied by a potential attacker. Variables without such marking may also, depending on how their values are created. Such variables should not be further expanded, used as filenames or used as command-line arguments for external commands.
>
> Exim4 Manual

## How do I "untaint" a variable?

You have to carry out some sort of function on it that uses its value to return a value from a trusted source. In my case, this was use an LDAP lookup to find the user's home directory and not build it from an expansion, eg.

Before:

```
once = /home/${local_part}/.email-away.once.db
```

After:

```
once = ${lookup ldap{ldap://ldap/dc=domain,dc=tld?homeDirectory?sub?(mail=${quote_ldap:${local_part}}@${quote_ldap:${domain}})}}/.email-away.once.db
```

It gives exactly the same answer, but if the `uid` is not found, then it will fail and not create a folder that may have a dodgy name with bad characters.

This became our `vacation_transport` file:

```
##Transport##
vacation_transport:
  driver = autoreply
  log = ${lookup ldap{ldap://ldap/dc=domain,dc=tld?homeDirectory?sub?(mail=${quote_ldap:${local_part}}@${quote_ldap:${domain}})}}/email-away.log
  once = ${lookup ldap{ldap://ldap/dc=domain,dc=tld?homeDirectory?sub?(mail=${quote_ldap:${local_part}}@${quote_ldap:${domain}})}}/.email-away.once.db
  once_repeat = 4d
  once_file_size = 0
  mode = 0600
  # Errors-To: is deprecated
  # There are arguments over whether this should send to the SMTP sender, or
  # to a From:, Reply-To: or Resent-From: header
  to = "${if def:h_Errors-To: {$h_Errors-To:} {$sender_address}}"
  file = ${lookup ldap{ldap://ldap/dc=domain,dc=tld?homeDirectory?sub?(mail=${quote_ldap:${local_part}}@${quote_ldap:${domain}})}}/email-away.msg
  # Set return_message to send the full text of the original message including headers
  # return_message
  subject = ${if def:h_subject: \
                {Out of Office AutoReply: Re: ${rfc2047:${quote:${escape:${length_60:$h_subject:}} }} }\
                {Out of Office AutoReply: I am not in the office} \
            }
  user = ${lc:${local_part}}
```

## Caveat

With this method, it looks up the incoming mail address in the mail attribute in LDAP. If the user is receiving mail to a mail alias, then the out of office won't work, eg.

Dominic's mail attribute stores `dominic.smith@domain.tld`, but he has an alias that accepts mail for `dominic@domain.tld`. Anything sent to `dominic@domain.tld` won't get an Out-of-Office reply.
