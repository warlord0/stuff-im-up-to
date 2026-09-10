---
pubDatetime: 2022-02-19T13:31:00Z
modDatetime: 2022-02-24T12:24:43Z
title: "Exim4 - LDAP Auth"
tags:
  - "email"
  - "exim4"
  - "ldap"
  - "Linux"
  - "smtp"
heroImage: "/blog-media/2018/11/debian_logo.png"
description: "Having setup postfix and LDAP auth , setting up an Exim server should be within our capabilities. The trouble is I find the exim config a bit scruffy and c"
---
Having setup [postfix and LDAP auth](https://warlord0blog.wordpress.com/2015/09/03/dovecot-postfix-virtual-mailboxes-and-active-directory/), setting up an Exim server should be within our capabilities.

The trouble is I find the exim config a bit scruffy and confusing. It all depends on whether you are using split config or not as to what your use of macros and the output of the config will be. Often I find myself adding to a config file only to find it doesn't get used in the final output.

Once I figured out where to put the config settings, it actually worked out well. This [Mr Zesty](https://braindump.mrzesty.net/doku.php/exim_smtp_authentication_against_ldap) document was of the biggest help.

I looked in the file `/etc/exi4/exim4.conf.template` and found the authentication section I thought I needed. It has the section `plain_server:` that I need to work with, but we have a split config, so this file doesn't get used at all! I need to look in `/etc/exim4/conf.d/auth` for the settings I need to add/edit.

There is already a file in here `30_exim4-config_examples` that has the section I need. I'm not going to edit a file called example - instead I completely remove it and add in my own file `01_ldap` with the following content based on Mr Zesty's instructions:

## /etc/exim4/conf.d/auth/01_ldap

```
plain:
  driver = plaintext
  public_name = PLAIN
  server_condition = ${if and{{ !eq{}{$auth2} }{ \
    ldapauth{\
      user="${quote_ldap:${lookup ldapdn{ldap://ldap/ou=People,dc=domain,dc=tld??sub?(uid=${quote_ldap:$auth2})}}}" \
      pass=${quote:$auth3} \
      ldap://ldap/} }} }
  server_set_id = $auth2
  server_prompts = :

login:
  driver = plaintext
  public_name = LOGIN
  server_condition = ${if and{{ !eq{}{$auth1} }\
    {!eq{}{${lookup ldapdn{ldap://ldap-01/dc=opusvl??sub?(&(cn=access-service-imap)(memberUID=${quote_ldap:${sg{$auth1}{\n}{}}}))}}} } \
    { \
    ldapauth{\
      user="${quote_ldap:${lookup ldapdn{ldap://ldap-01/ou=People,dc=opusvl??sub?(uid=${quote_ldap:${sg{$auth1}{\n}{}}})}}}" \
      pass=${quote:${sg{$auth2}{\n}{}}} \
      ldap://ldap-01/} }} \
    }
  server_set_id = ${sg{$auth1}{\n}{}}
  server_prompts = Username:: : Password::
```

There's a lot to take in here. It's not as complicated as it looks. The parts of interest are, **`ldap://ldap/ou=People,dc=domain,dc=tld`** and **`uid=`** these tell us where the LDAP query will run and what attribute to use to do the lookup. Change these to suit your LDAP schema.

## Testing

Mr Zesty shows us how to test our query using a single command line, I tweaked it for our environment and elevated using sudo as we don't run as root:

```
ldapsearch -xvvv -D$(sudo exim -be '${lookup ldapdn{ldap://ldap/ou=People,dc=domain,dc=tld??sub?(uid=${quote_ldap:myuser})}}') -W uid=myuser dn
```

If this works you will be asked for the users' password (-W) and once supplied, and successfully validated it should return the `dn` of the user.

```
ldap_initialize( <DEFAULT> )
Enter LDAP Password: 
filter: uid=myuser
requesting: dn 
# extended LDIF
#
# LDAPv3
# base <dc=domain,dc=tld> (default) with scope subtree
# filter: uid=myuser
# requesting: dn 
#

# myuser, People, domain, tld
dn: uid=myuser,ou=People,dc=domain,dc=tld

# search result
search: 2
result: 0 Success

# numResponses: 2
# numEntries: 1
```

If you get the password wrong, you will get an obvious failure message:

```
ldap_initialize( <DEFAULT> )
Enter LDAP Password: 
ldap_bind: Invalid credentials (49)
```

We can then expand on the LDAP query to add other checks to ensure a user is a member of a valid group that can send email:

```
user="${quote_ldap:${lookup ldapdn{ldap://ldap/ou=People,dc=domain,dc=tld??sub?(&(uid=${quote_ldap:$auth1})(memberOf=access-service-smtp))}}}"
```

## memberUID vs memberOf

When using an LDAP server with a schema that uses, `memberUID` I got creative with the `server_condition` and expanded the `and{}` statement to check if the user is a member of the group and if the auth is successful, using something like this:

```
  server_condition = ${if and{{ !eq{}{$auth1} }\
    {!eq{}{${lookup ldapdn{ldap://ldap/dc=domain,dc=tld??sub?(&(cn=access-service-smtp)(memberUID=${quote_ldap:$auth1}))}}} } \
    { \
    ldapauth{\
      user="${quote_ldap:${lookup ldapdn{ldap://ldap/ou=People,dc=domain,dc=tld??sub?(uid=${quote_ldap:$auth1})}}}" \
      pass=${quote:$auth2} \
      ldap://ldap/} }} \
    }
```

Took some wrangling with the `{}`'s to get that to work as I want. It does a lookup of the `memberUID` in the group `access-service-smtp`, if that returns something, it will not be equal to nothing `!eq{}` and will cause the whole `and{}` to return false. In turn, that means the authentication fails

## Using swaks

[swaks](https://linux.die.net/man/1/swaks) is a great tool for testing SMTP because it can be told to try using different authentication and tls settings, without resorting to manipulating your Thunderbird settings. Here are some samples of how I use it:

#### Testing submissions (465 - TLS)

```
swaks --to someone@example.com --from myuser@domain.tld  --server mail.domain.tld:465 -tlsc -auth PLAIN --auth-user myuser

swaks --to someone@example.com --from myuser@domain.tld  --server mail.domain.tld:465 -tlsc -auth LOGIN --auth-user myuser
```

#### Testing submission (587 - STARTTLS)

```
swaks --to someone@example.com --from myuser@domain.tld  --server mail.domain.tld:587 -tls -auth PLAIN --auth-user myuser

swaks --to someone@example.com --from myuser@domain.tld  --server mail.domain.tld:587 -tls -auth LOGIN --auth-user myuser
```

## Verifying Certificates with openssl

You can use openssl as a client to connect to the server and see what certificates get presented.

#### Using submissions

```
openssl s_client -connect mail.domain.tld:465 -tls1_3
```

The option `-tls1_3` can be changed to test for older version support, eg. `tls1, tls1_1, tls1_2`

#### Using submission

```
openssl s_client -connect mail.domain.tld:587 -starttls smtp -tls1_3
```

## References

[https://braindump.mrzesty.net/doku.php/exim_smtp_authentication_against_ldap](https://braindump.mrzesty.net/doku.php/exim_smtp_authentication_against_ldap)
