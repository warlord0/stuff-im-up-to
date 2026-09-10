---
pubDatetime: 2017-03-02T11:37:12Z
modDatetime: 2017-02-28T21:44:21Z
title: "Diving Deeper into Windows SSL"
tags:
  - "Security"
  - "ssl"
  - "Windows"
heroImage: "/blog-media/2017/02/download-10-e1488295217214.jpg"
description: "This response to a question raised some interest and I found it very interesting. I then went to investigate the keys and values on my own machine. This ca"
---
This response to a question raised some interest and I found it very interesting. I then went to investigate the keys and values on my own machine. This can also be controlled using `gpedit.msc`, but found it interesting to see the current entries for myself.

    HKLM\System\CurrentControlSet\Control\Cryptography\Configuration\Local\SSL\00010002 Functions

> While not "incorrect" Steven's answer is incomplete. The linked article is a very good description for how to enable and disable cipher suites like SSL 2.0 etc, but SH's pen test comments posted are also concerned about the mode of operation of the ciphers used - specifically about removing the use of CBC (Cipher Block Chaining) and using Counter (CTR) or Galois Counter (GCM). This is not fully covered in that answer. In order to direct how the transport security is negotiated in this more granular level, they will also need to look at the content and ordering of the Functions list. This controls the preferred order and what is acceptable when the transport security is negotiated between server/webserver and client/browser.
>
>     HKLM\System\CurrentControlSet\Control\Cryptography\Configuration\Local\SSL\00010002  Functions
>
> Removal of CBC modes of operation from the list would prevent their sucesful negociation, but removal of all CBC is likely to have negative impact. Adjusting this list must be done with great care as misconfiguration will prevent sucesful connections. Support for modern modes of block cipher operation such as e.g. AES-GCM are still not completely widespread (March 2016) in all clients/browsers and OS versions. As with much of crypto, what might be appropriate for state top-secrets and what might be appropriate for information of very low confidentiality won't always be the same. A balanced approach for information assurance is needed depending on the categorization of the specific information and not an approach like CBC is "bad" GCM is "good". S.H. should probably return to his/her pen testers to discuss whether their specific use of CBC modes may be acceptable for a while longer until GCM is better adopted, before testing any adjustements to the Functions list. Tuesday, March 08, 2016 9:46 AM, Tom Hollinghurst

  References: [https://social.technet.microsoft.com/Forums/windowsserver/en-US/a51f9574-73b0-4808-ad5f-4db081d80e6f/disable-cbc-mode-cipher-encryption-and-enable-ctr-or-gcm-cipher-mode-encryption-disable-md5-and?forum=winserversecurity](https://social.technet.microsoft.com/Forums/windowsserver/en-US/a51f9574-73b0-4808-ad5f-4db081d80e6f/disable-cbc-mode-cipher-encryption-and-enable-ctr-or-gcm-cipher-mode-encryption-disable-md5-and?forum=winserversecurity)
