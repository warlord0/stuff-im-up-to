---
pubDatetime: 2020-04-14T11:49:13Z
title: "Asterisk - IAX"
tags:
  - "asterisk"
  - "Linux"
heroImage: "/blog-media/2020/03/1280px-asterisk_logo.svg_.png"
description: "I just spent the best part of the morning trying to setup Inter Asterisk eXchange between two hosts on the same network. This was described to me as \"an ea"
---
I just spent the best part of the morning trying to setup [Inter Asterisk eXchange](https://wiki.asterisk.org/wiki/pages/viewpage.action?pageId=4817132) between two hosts on the same network. This was described to me as "an easy way to attach a pair of Asterisk servers over a secure link" - which was fine until the "easy" part.

The example I was given was to setup a `friend` type of account which is both a `peer` and a `user` and so should be easier. It didn't turn out that way.

I turned on peer debugging and I could see my connections were constantly refused:

```
*CLI> iax2 set debug peer servera
```

```
Rx-Frame Retry[ No] -- OSeqno: 001 ISeqno: 002 Type: IAX     Subclass: ACK    
    Timestamp: 00214ms  SCall: 16203  DCall: 11421 192.168.0.22:4569
Rx-Frame Retry[ No] -- OSeqno: 001 ISeqno: 002 Type: IAX     Subclass: REGREJ 
    Timestamp: 00020ms  SCall: 16203  DCall: 11421 192.168.0.22:4569
    CAUSE           : Registration Refused
    CAUSE CODE      : 29
```

I gave up on the `friend` and decided to try the separate `peer` and `user`.

> \`servera\` and \`serverb\` must be resolvable to an IP in this instance or replace the name following the @ with an IP. You should probably NOT use the same password on each side as I have in this example.

#### iax.conf - Server A

```
[general]

autokill=yes

register => servera:dd02c7c2232759874e1c205587017bed@serverb

[serverb]
type=peer
host=dynamic
secret=dd02c7c2232759874e1c205587017bed
context=call-router
permit=0.0.0.0/0.0.0.0

[servera]
type=user
secret=dd02c7c2232759874e1c205587017bed
context=call-router
```

#### iax.conf - Server B

```
[general]

autokill=yes

register => servera:dd02c7c2232759874e1c205587017bed@servera

[servera]
type=peer
host=dynamic
secret=dd02c7c2232759874e1c205587017bed
context=call-router
permit=0.0.0.0/0.0.0.0

[servera]
type=user
secret=dd02c7c2232759874e1c205587017bed
context=call-router
```

Then an reload of IAX on both systems and the registrations and call routing, using my `context=call-router` work as expected.

```
*CLI> iax2 reload
    -- Registered IAX2 to '192.168.0.111:4569', who sees us as 192.168.0.22:4569 with no messages waiting
    -- Registered IAX2 'serverb' (AUTHENTICATED) at 192.168.0.111:4569
```
