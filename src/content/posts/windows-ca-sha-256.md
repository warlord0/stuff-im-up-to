---
pubDatetime: 2016-09-27T08:53:14Z
modDatetime: 2016-09-27T08:53:26Z
title: "Windows CA SHA-256"
tags:
  - "certificates"
  - "Windows"
heroImage: "/blog-media/2016/09/windows-server-2012-1024x196.png"
description: "Has it really been 10 years since I deployed a Windows Certificate Authority? Well obviously it has as the certificate is up for renewal. Not only that the"
---
Has it really been 10 years since I deployed a Windows Certificate Authority? Well obviously it has as the certificate is up for renewal. Not only that the Signing Algorithm used is currently SHA-1 which is causing some complaint from our vulnerability scanning. Time for an upgrade. In order to satisfy the requirement for SHA-256 you need to use the newer provider KSP as the current one is CSP. Thankfully Microsoft have a useful article on how to achieve this here: [Migrating a Certification Authority Key from a Cryptographic Service Provider (CSP) to a Key Storage Provider (KSP)](https://technet.microsoft.com/en-us/library/dn771627%28v=ws.11%29.aspx). Following this made the process fairly straightforward, although left me wondering why they chose to do it all from the PowerShell command line. None the less within half an hour I was able to migrate the provider type from CSP to KSP and update the CA key to SHA-256 and 2048bits. Backing up the CA couldn't be easier, but could just as easily be achieved in the Certificate Authority GUI. The deletion of certificates could also be carried out from the MMC local Computer snap-in for certificates. In fact this is where the instructions fell down for me. Step 6 to export the CA cert as a pfx file fails with the error:

    CertUtil: -exportPFX command FAILED: 0x8009000b (-2146893813 NTE_BAD_KEY_STATE) 
    CertUtil: Key not valid for use in specified state.

This because the previous import step 5a. does not (well did not for me) mark the key as exportable. So you're probably not going to be able to do step 6. Strange thing is that the -importpfx is supposed to mark it exportable unless you specify the "NoExport" switch. So to resolve this I started the MMC GUI and added the Certificate Snap-in for Local Computer and carried out step 5 by right clicking, choosing All Tasks and Import... Then during the wizard process to bring the certificate in simply tick the box to Mark this key as exportable. Then it's back to step 6 and through to complete the process.
