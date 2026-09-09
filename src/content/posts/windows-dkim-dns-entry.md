---
pubDatetime: 2016-11-24T14:25:54Z
modDatetime: 2016-11-24T14:27:36Z
title: "Windows DKIM DNS Entry"
tags:
  - "dkim"
  - "dns"
  - "Networking"
  - "Windows"
description: "Windows always gives me a bit of grief when trying anything a little out of the ordinary. I always find doing the same thing on Linux way simpler. This time it was relating to a DNS TXT entry for DKIM that is longer than 255 characters."
---
Windows always gives me a bit of grief when trying anything a little out of the ordinary. I always find doing the same thing on Linux way simpler. This time it was relating to a DNS TXT entry for DKIM that is longer than 255 characters. As we have a split DNS system out external DNS entries need to be manually mirrored internally. This is because often the DNS reply is different if you're from an internal network to that of an external one. The 255 character limit was no problem for the external system. It parsed the string and split it into the required elements automatically. Internally you MUST split it yourself and enter it into the Windows DNS server as separate lines, delimited with a carriage return. Using DIG I could see the response from outside being returned correctly. But from inside it took me a few attempts to get Windows to leave it alone and make the entry the same. Using the Google DNS server 8.8.8.8

```

# dig TXT selector._domainkey.domain.tld @8.8.8.8

; <<>> DiG 9.9.5-9+deb8u8-Debian <<>> TXT selector._domainkey.domain.tld @8.8.8.8
;; global options: +cmd
;; Got answer:
;; ->>HEADER< ;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

;; OPT PSEUDOSECTION:
; EDNS: version: 0, flags:; udp: 512
;; QUESTION SECTION:
;selector._domainkey.domain.tld. IN TXT

;; ANSWER SECTION:
selector._domainkey.domain.tld. 599 IN TXT "v=DKIM1\; k=rsa\; g=*\; s=email\; h=sha1\; t=s\; p=MIIBIjANBgkqhkiG9w0BAQE" "FAAOCAQ8AMIIBCgKCAQEApidPCc1lK6kyhDamOJEAbzde9vCUqtKyk+wTnj5dTTT6WUiYLE0bUJYMiEt/v6IdOa87fSu0e3+gpvsGJj" "h8T1hJVUlVSFlBYY5tOQzhJ0B1Wn/nnB3fkhoHEiA0k1xzRfa9RBVyKhi6/SIT/N6/JHzj8NlWArQgMGXZGM3wyKrfMjwJzxT8nbcVU2M0nfSSrJh0" "zRR7nCXzRUVCRFDKqZrDAPKynkIe4hc/3LMY4ff6ImIjdOT71SI8BKP/vS/s/jcE7HxLj7y/yDoo7S" "fEbDTcoyeHUZ8o1QjuS+YCSFbvvyD7dZlBkparsZT1Tkd64CmTATPiVKAE45O0auiwFQIDAQAB\;"

;; Query time: 44 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)
;; WHEN: Thu Nov 24 14:15:15 GMT 2016
;; MSG SIZE rcvd: 556
```

Notice the `"` and spaces in the reply. If you paste quotes into the Windows DNS GUI it sticks back slashes (`\`) in and you end up returning an invalid entry. When pasting the data in make sure you remove all the quote, space, quote (`" "`) with just a carriage return. Then when you use a dig on your internal server you should see it's the same internal as external - quick check of the `MSG SIZE rcvd` line should help see if both internal and external are the same.
