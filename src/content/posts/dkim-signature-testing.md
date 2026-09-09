---
pubDatetime: 2016-11-24T13:56:30Z
modDatetime: 2016-11-24T13:57:56Z
title: "DKIM Signature Testing"
tags:
  - "dkim"
  - "Linux"
  - "smtp"
description: "After setting up a DKIM DNS entry and then sending email we were seeing one of authorised 3rd parties failing to pass the DKIM checks. The DNS record looked OK but the mail systems like Google and Yahoo were saying it was failing. So how do I go about testing a message I received so I can see for myself what's going on?"
---
After setting up a DKIM DNS entry and then sending email we were seeing one of authorised 3rd parties failing to pass the DKIM checks. The DNS record looked OK but the mail systems like Google and Yahoo were saying it was failing. So how do I go about testing a message I received so I can see for myself what's going on? Looks like the answer is to use a Perl module "Mail::DKIM::Verifier" Oh no, Perl. I have no real Perl experience so how am I going to figure all this out? Things were a little bumpy trying to get this working, but once I'd figured the recipe it's pretty straight forward. First you'll need to make sure you have perl installed. Pretty much will be as it's used by so many things in Linux. A simple check from the shell:

    $ perl -v

Now it's a case of making sure you have the necessary components to support the Mail::DKIM::Verifier module. I tried to install the module and got all kinds of failures that were greek to me. Turns out having OpenSSL isn't good enough you need to make sure you have the headers from the development package too:

    $ sudo apt-get install libssl-dev

Now we can go into Perl CPAN and install the necessary modules:

    $ cpan
    cpan[1]> install Crypt::OpenSSL::RSA
    cpan[2]> install Mail::DKIM::Verifier
    cpan[3]> quit

*These are case sensitive.* The Crypt::OpenSSL::RSA may be installed automatically if you just call the install Mail::DKIM::Verifier, but as I found it was related to the openssl header that what were causing my installation failures I installed it before trying the DKIM module install. Once the modules are installed I just used the Perl script [`dkimverify.pl`](https://metacpan.org/pod/distribution/Mail-DKIM/scripts/dkimverify.pl) by pasting it into a text file and making it executable. To use it just direct the output of a text format email message into it like so:

    $ ./dkimverify.pl < message.txt

This should result in the DKIM-Signature: header in the message being validated using the public key from the DNS record.

    originator address: noreply@domain.tld
    signature identity: @domain.tld
    verify result: pass
    sender policy result: accept
    author policy result: accept
    ADSP policy result: accept
