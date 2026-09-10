---
pubDatetime: 2018-04-18T07:37:05Z
modDatetime: 2018-05-16T07:39:36Z
title: "Azure ADFS Certificate Notification"
tags:
  - "azure"
  - "office 365"
  - "Windows"
heroImage: "/blog-media/2018/01/office-365-logo-01.jpg"
description: "We've been using Azure for a few months now so it's about time our certificates would expire right? Well according to the email notification we've just rec"
---
We've been using Azure for a few months now so it's about time our certificates would expire right? Well according to the email notification we've just received a certificate needs updating or we'll lose access!

> In order to provide your organization with uninterrupted access to Office 365 and Microsoft Azure Active Directory (Azure AD), you need to ensure your certificate for the domain(s) **domain.tld** is renewed and updated in Azure AD right away. Our current certificate on file for domain(s) **domain.tld** expires on **5/5/2018**. If you don’t take action, your users will lose access on this date or, in the default configuration of Active Directory Federation Services, 15 days prior to **5/5/2018**. **What you should do right now** If you are using AD FS with the default configuration, or are using a third party STS or a non-default configuration of AD FS, follow the article [here](https://docs.microsoft.com/en-us/azure/active-directory/connect/active-directory-aadconnect-o365-certs).

In short check that `AutoCertificateRollover` is set to True

    PS> Get-AdfsProperties | fl AutoCertificateRollover

Check the thumbprints match AND the expiry dates of the certificates:

    PS> Get-MsolFederationProperty -DomainName domain.tld | FL Source, TokenSigningCertificate

    Source                  : ADFS Server
    TokenSigningCertificate : [Subject]
                                CN=ADFS Signing - adfs.domain.tld

                              [Issuer]
                                CN=ADFS Signing - adfs.domain.tld

                              [Serial Number]
                                5DB54681AC561D994765FA59C1552141

                              [Not Before]
                                5/5/2017 4:01:18 PM

                              [Not After]
                                5/5/2018 4:01:18 PM

                              [Thumbprint]
                                B66B38DAA9D962965A349333F6872173998579DF


    Source                  : Microsoft Office 365
    TokenSigningCertificate : [Subject]
                                CN=ADFS Signing - adfs.domain.tld

                              [Issuer]
                                CN=ADFS Signing - adfs.domain.tld

                              [Serial Number]
                                5DB54681AC561D994765FA59C1552141

                              [Not Before]
                                5/5/2017 4:01:18 PM

                              [Not After]
                                5/5/2018 4:01:18 PM

                              [Thumbprint]
                                B66B38DAA9D962965A349333F6872173998579DF

So what now? My certificate will expire within 15 days but it is set to auto rollover. I followed [Step 1](https://docs.microsoft.com/en-us/azure/active-directory/connect/active-directory-aadconnect-o365-certs#manualrenew) and when I tried to update the certificate:

    PS> Update-ADFSCertificate –CertificateType token-signing

    Update-ADFSCertificate : PS0139: A certificate of type 'Signing' already exists and is due to be promoted to primary at 'Monday, April 23, 2018'. If you want to remove the current set of certificates and generate new primary certificates, run the Update-ADFSCertificate command with the -Urgent option.
    At line:1 char:1
    + Update-ADFSCertificate –CertificateType token-signing
    + ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
     + CategoryInfo : InvalidOperation: (:) [Update-AdfsCertificate], InvalidOperationException
     + FullyQualifiedErrorId : PS0139,Microsoft.IdentityServer.Management.Commands.UpdateCertificateCommand

> **So do I just wait until April 23?**

### Find out if you're running on the primary ADFS server

    PS> Get-AdfsSyncProperties

    LastSyncFromPrimaryComputerName : AZADFS01.domain.local
    LastSyncStatus                  : 0
    LastSyncTime                    : 4/18/2018 11:01:46 AM
    PollDuration                    : 300
    PrimaryComputerName             : AZADFS01.domain.local
    PrimaryComputerPort             : 80
    Role                            : SecondaryComputer

If you are on the primary the Role will show:

    Role
    ----
    PrimaryComputer

## Update May 14

.We managed to get past April 23 and we could all continue to logon successfully so things looked good until May 14. Then we lost the ability to logon to the Office 365 portal using ADFS from inside and outside the organisation. The symptoms were misleading in that no error message appears. The user isn't told they cannot logon or their password is bad, it simply returns back to the Microsoft "Pick an Account" logon page and may present you with just click your ID to logon. But it will just loop back to the same page with no alert. We were out of our depth so called support. Two days later we were back up an running after they pretty much followed the [manual process](https://docs.microsoft.com/en-us/azure/active-directory/connect/active-directory-aadconnect-o365-certs) of updating the federation trust.

    PS> Update-MsolFederatedDomain -domainname domain.tld -SupportMultipleDomain

So I guess now we just wait until 15 May 2019 when the certificate will need renewing again.
