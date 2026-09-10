---
pubDatetime: 2017-03-02T10:54:40Z
title: "Mozilla Thunderbird Logging"
tags:
  - "Networking"
  - "smtp"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "I had the need to view the actual SMTP server conversation to confirm TLS and authentication were being used. I could have done this from server logs, but as we transmit thousands of SMTP messages a day it was easier to look to the client for logs, rather than for the needle in a stack of other needles."
---
I had the need to view the actual SMTP server conversation to confirm TLS and authentication were being used. I could have done this from server logs, but as we transmit thousands of SMTP messages a day it was easier to look to the client for logs, rather than for the needle in a stack of other needles. Turns out getting logs from Thunderbird is easy. I was only interested in the SMTP log, but you can capture POP and IMAP too. All you need do is set two environment variables. What to log:

    c:\> set NSPR_LOG_MODULES=SMTP:4

Where to log to:

    c:\> set NSPR_LOG_FILE=C:\temp\tbird_log.txt

Then run Thunderbird using:

    c:\> start thunderbird

That's it. Now you'll see you log being populated. You can add in, or replace with `IMAP:4` and `POP:4` in the `NSPR_LOG_MODULES` variable just by separating them with commas to log those protocols too.

    5788[1911140]: SMTP Connecting to: smtp.domain.local
    5788[1911140]: SMTP entering state: 0
    5788[1911140]: SMTP Response: 220 mail.domain.local Microsoft ESMTP MAIL Service ready at Thu, 2 Mar 2017 10:15:54 +0000
    5788[1911140]: SMTP entering state: 14
    5788[1911140]: SMTP Send: EHLO [10.9.8.4]

    5788[1911140]: SMTP entering state: 0
    5788[1911140]: SMTP Response: 250-mail.domain.local Hello [192.168.0.115]
    5788[1911140]: SMTP entering state: 0
    5788[1911140]: SMTP Response: 250-SIZE 10485760
    5788[1911140]: SMTP entering state: 0
    5788[1911140]: SMTP Response: 250-PIPELINING
    5788[1911140]: SMTP entering state: 0
    5788[1911140]: SMTP Response: 250-DSN
    5788[1911140]: SMTP entering state: 0
    5788[1911140]: SMTP Response: 250-ENHANCEDSTATUSCODES
    5788[1911140]: SMTP entering state: 0
    5788[1911140]: SMTP Response: 250-STARTTLS
    5788[1911140]: SMTP entering state: 0
    5788[1911140]: SMTP Response: 250-AUTH
    5788[1911140]: SMTP entering state: 0
    5788[1911140]: SMTP Response: 250-8BITMIME
    5788[1911140]: SMTP entering state: 0
    5788[1911140]: SMTP Response: 250-BINARYMIME
    5788[1911140]: SMTP entering state: 0
    5788[1911140]: SMTP Response: 250-CHUNKING
    5788[1911140]: SMTP entering state: 0
    5788[1911140]: SMTP Response: 250 XEXCH50
    5788[1911140]: SMTP entering state: 4
    5788[1911140]: SMTP entering state: 21
    5788[1911140]: SMTP Send: STARTTLS

    5788[1911140]: SMTP entering state: 0
    5788[1911140]: SMTP Response: 220 2.0.0 SMTP server ready

References: [http://lawrit.lawr.ucdavis.edu/it-help-center/faq/how-do-i-log-thunderbird-email/view](http://lawrit.lawr.ucdavis.edu/it-help-center/faq/how-do-i-log-thunderbird-email/view)
