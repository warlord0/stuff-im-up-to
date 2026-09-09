---
pubDatetime: 2015-10-12T07:36:15Z
modDatetime: 2016-09-19T17:51:38Z
title: "Synology & SMTP"
tags:
  - "Linux"
  - "smtp"
  - "synology"
description: "This box runs Linux and many of my favourite services so can handle Postfix, Dovecot, SpamAssassin and many others that are documented here. There are a fe"
---
This box runs Linux and many of my favourite services so can handle Postfix, Dovecot, SpamAssassin and many others that are documented here. There are a few quirks though. After all it is highly stylised and GUI based so the configs are driven by the web interface. That just needs some careful consideration as they will be overwritten every time the server starts. So you just need to ensure you edit the "template" files that the GUI will apply.

### Adding SMTP support for TLS

Normally you'd edit the Postfix config file /volume1/@appstore/MailServer/etc/main.cf, but as this gets overwritten you need to make changes to /var/packages/MailServer/target/etc/template/main.template file instead. Here are the changes/additions made to the end of the file to get TLS working to recipient servers, I also commented out the authenticated header as I don't want external recipients knowing too much about the setup of my server and users:

    # smtpd_sasl_authenticated_header = yes 
     smtpd_use_tls=true
     smtpd_tls_mandatory_protocols = TLSv1
     smtpd_tls_mandatory_ciphers = medium
     smtp_tls_loglevel=1
     smtp_tls_security_level=may
     smtp_tls_mandatory_protocols = TLSv1
     smtp_tls_mandatory_ciphers = medium
     smtp_tls_note_starttls_offer=yes
     smtpd_tls_received_header=yes

There's already a header_checks added in to help us to obfuscate our internal details:

    header_checks = regexp:/var/packages/MailServer/target/etc/header_checks

So here's the header_checks file: Content of /etc/postfix/header_checks so it removes headers with the internal IP range:

    /^Received:.*\[192\.168\.[0-9]\.[0-9]/ IGNORE
     /^Received:.*\[127\.0\.0\.1/ IGNORE
