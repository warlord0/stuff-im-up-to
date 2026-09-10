---
pubDatetime: 2020-04-13T13:59:32Z
modDatetime: 2023-04-21T17:52:01Z
title: "Asterisk - SIP + TLS"
tags:
  - "asterisk"
  - "Linux"
  - "Security"
  - "tls"
heroImage: "/blog-media/2020/03/1280px-asterisk_logo.svg_.png"
description: "Given that the SIP credentials passed by Asterisks real-time backends are stored as either MD5 or plain-text It's best that we think about securing the com"
---
Given that the SIP credentials passed by Asterisks real-time backends are stored as either MD5 or plain-text It's best that we think about securing the communication over TLS.

Modify the `pjsip.conf` to point to your certificates. I got mine using certbot and [Lets Encrypt](https://letsencrypt.org/), then copied them into the `etc/asterisk/keys` folder as this seems to fit the documentation.

#### pjsip.conf

```
[transport-tls]
type=transport
protocol=tls
bind=0.0.0.0:5061
cert_file=/etc/asterisk/keys/fullchain1.pem
priv_key_file=/etc/asterisk/keys/privkey1.pem

cipher=ECDHE-RSA-AES256-GCM-SHA384,ECDHE-RSA-CHACHA20-POLY1305,ECDHE-RSA-AES128-GCM-SHA256,ECDHE-RSA-AES256-SHA384,ECDHE-RSA-AES128-SHA256,ECDHE-RSA-AES256-SHA,ECDHE-RSA-AES128-SHA,AES256-GCM-SHA384,AES128-GCM-SHA256,AES256-SHA256,AES128-SHA256,AES256-SHA,AES128-SHA

method=tlsv1_2
```

Notice the `method=tlsv1_2` to elevate it from the default `tlsv1` and the list of ciphers that can be used. These should probably be reduced to only the more secure ciphers.

This also uses port 5061 as it must be different to the one used for any other transport and 5060 is used by `transport-udp`.

Make sure when you copy in the certificates that they are readable by asterisk. If they aren't then the port will fail to become active and you'll see error messages in the log about not being able to read the files.

If everything went well we should be able to see the `transport-tls` transport listed:

```
*CLI> pjsip show transports

Transport:  <TransportId........>  <Type>  <cos>  <tos>  <BindAddress....................>
==========================================================================================

Transport:  transport-tls             tls      0      0  0.0.0.0:5061
Transport:  transport-udp             udp      0      0  0.0.0.0:5060

Objects found: 2
```

In my `ps_endpoints` postgres table I removed the `transport-tls` from the `transport` field and added `media_encryption = sdes`.

```
UPDATE ps_endpoints set transport = null, media_encryption = 'sdes';
```

## More Detail

I ran `nmap` to get a list of ciphers available on my TLS port 5061 from outside on the internet:

```
$ nmap -sV --script ssl-enum-ciphers pbx.domain.tld -p 5061
Starting Nmap 7.70 ( https://nmap.org ) at 2020-04-13 14:31 BST
Nmap scan report for pbx.domain.tld (100.200.123.123)
Host is up (0.026s latency).
rDNS record for 100.200.123.123: pbx.domain.tld

PORT     STATE SERVICE       VERSION
5061/tcp open  ssl/sip-proxy Asterisk PBX GIT-master-7a04947abd
| ssl-enum-ciphers: 
|   TLSv1.2: 
|     ciphers: 
|       TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA (secp256r1) - A
|       TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256 (secp256r1) - A
|       TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256 (secp256r1) - A
|       TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA (secp256r1) - A
|       TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384 (secp256r1) - A
|       TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384 (secp256r1) - A
|       TLS_ECDHE_RSA_WITH_CHACHA20_POLY1305_SHA256 (secp256r1) - A
|       TLS_RSA_WITH_AES_128_CBC_SHA (rsa 2048) - A
|       TLS_RSA_WITH_AES_128_CBC_SHA256 (rsa 2048) - A
|       TLS_RSA_WITH_AES_128_GCM_SHA256 (rsa 2048) - A
|       TLS_RSA_WITH_AES_256_CBC_SHA (rsa 2048) - A
|       TLS_RSA_WITH_AES_256_CBC_SHA256 (rsa 2048) - A
|       TLS_RSA_WITH_AES_256_GCM_SHA384 (rsa 2048) - A
|     compressors: 
|       NULL
|     cipher preference: client
|_  least strength: A
Service Info: Device: PBX

Service detection performed. Please report any incorrect results at https://nmap.org/submit/ .
Nmap done: 1 IP address (1 host up) scanned in 19.38 seconds
```

They all came back as Class A, so no worries there.

### Hints

There are some things you can do to help yourself debug issues. First thing I did was get access to the logs. Because supervisor runs asterisk supervisor handles the logs. To get to them I mounted the `/var/log/supervisor` folder so I could see it outside of the container set.

```
- "${PWD}/log/supervisor:/var/log/supervisor"
```

Now you can read the `stdout` file and see everything that happens. It was very helpful finding reasons why certificates couldn't be read or accessed. In particular you need to search for something like this in the log to show it's working:

```
[Apr 13 13:06:57] == 'TLS+IPv4' is an available SIP transport
```

If it's not able to come up then it will show as unavailable and around that area in the log you'll find the reason why.

Tcpdump proved useful to actually see if packets where coming through the firewall to the server, to check my port forward was working:

```
$ sudo tcpdump -i eth0 port 5061
```

```
tcpdump: verbose output suppressed, use -v or -vv for full protocol decode
listening on eth0, link-type EN10MB (Ethernet), capture size 262144 bytes
14:48:53.395633 IP 82-132-236-143.dab.02.net.30920 > pbx.domain.tld.sip-tls: Flags [P.], seq 3152788405:3152789437, ack 1210388055, win 3175, options [nop,nop,TS val 3983991347 ecr 4074969410], length 1032
14:48:53.395695 IP pbx.domain.tld.sip-tls > 82-132-236-143.dab.02.net.30920: Flags [.], ack 1032, win 501, options [nop,nop,TS val 4074994357 ecr 3983991347], length 0
14:48:53.482434 IP pbx.domain.tld.sip-tls > 82-132-236-143.dab.02.net.30920: Flags [P.], seq 1:552, ack 1032, win 501, options [nop,nop,TS val 4074994444 ecr 3983991347], length 551
14:48:53.546170 IP 82-132-236-143.dab.02.net.30920 > pbx.domain.tld.sip-tls: Flags [.], ack 552, win 3266, options [nop,nop,TS val 3983991498 ecr 4074994444], length 0
14:48:53.547349 IP 82-132-236-143.dab.02.net.30920 > pbx.domain.tld.sip-tls: Flags [P.], seq 1032:1384, ack 552, win 3266, options [nop,nop,TS val 3983991498 ecr 4074994444], length 352
14:48:53.547369 IP pbx.domain.tld.sip-tls > 82-132-236-143.dab.02.net.30920: Flags [.], ack 1384, win 501, options [nop,nop,TS val 4074994509 ecr 3983991498], length 0
14:48:53.572032 IP 82-132-236-143.dab.02.net.30920 > pbx.domain.tld.sip-tls: Flags [P.], seq 1384:2699, ack 552, win 3266, options [nop,nop,TS val 3983991524 ecr 4074994509], length 1315
14:48:53.572049 IP pbx.domain.tld.sip-tls > 82-132-236-143.dab.02.net.30920: Flags [.], ack 2699, win 501, options [nop,nop,TS val 4074994533 ecr 3983991524], length 0
14:48:53.603333 IP pbx.domain.tld.sip-tls > 82-132-236-143.dab.02.net.30920: Flags [P.], seq 552:930, ack 2699, win 501, options [nop,nop,TS val 4074994565 ecr 3983991524], length 378
```

## Android SIP Client

For my Android client I'm using [Grandstream Wave](https://play.google.com/store/apps/details?id=com.grandstream.wave), it's free and works well.

You don't need to specify a port in the "Account Settings \> Account \> Edit Account SIP Server" as by choosing "Account Settings \> Account \> Transmission Protocol \> TLS" is defaults to 5061.
