---
pubDatetime: 2018-01-28T17:30:51Z
modDatetime: 2018-01-29T11:25:40Z
title: "Microsoft Office 365: Day One"
tags:
  - "office 365"
  - "Web"
  - "Windows"
heroImage: "/blog-media/2018/01/office-365-logo-01.jpg"
description: "So today's been the first day following the consultants departure. They configured our Exchange 2013 estate to act as a hybrid solution to allow us to migr"
---
So today's been the first day following the consultants departure. They configured our Exchange 2013 estate to act as a hybrid solution to allow us to migrate our mail box users onto Outlook 365. The config and setup certainly seemed more straight forward on the cloud side than the "on premise" parts. We had plenty to do to setup autodiscover DNS records internal and external, reverse proxying and ActiveSync setups with Sophos Mobile Control. But now the consultants have gone we're left picking up the pieces. As it seems no job is left finished.

## User Principal Name

We tested some mail box migrations from on premise to the cloud with test accounts. But today was the day to move my mail box as a real user test. Things we expected to fail pretty much did. Part of the migration process was changing our User Principal Names (UPN's) from username@domain.local to the actual users external email address - `forename.surname@domain.tld`. There are a number of business applications that use single sign on, many using LDAP and this is where we were unsure if it used UPN or sAMAccountName. We still have to figure some of those out I guess, but the main thing it broke was a secure Linux email server. This use UPN and required a minor config change to handle `sAMAccountName@domain.local` instead. But because our UPN's in Active Directory haven't been changed, only those where the mail box is migrated, we've found that they don't sync to the cloud address book. This means that now my mail box has moved I can't email anyone in `@domain.tld` until we change all the UPN's and the cloud has sync'd them all in the new format. So a bit of application testing is required as we change everyone's UPN.

## Android Exchange Client

With my mail box on the cloud my LG G3 (Android 6.0 - yes, old, but serviceable) phone stopped receiving email. I'd hoped that SMC and AutoDiscover might sort it not, but secretly expected it not to. Sure enough I needed to tear out my Exchange settings and setup the server connection again. But try as I might I couldn't get it to authenticate me. I used domain\user, email address. user, and no success. Looking in the SMC `EASProxy.log` showed some strange behaviour. It came up with unable to get authentication details from the  header and showed the user and Active Sync ID as 'null'. It caused some flapping in a Java exception and left me thinking something isn't right with the client rather than server, as other phones worked with test users. So then I thought I'd leave the LG's email client alone and have a go with GMail. This was much better. It at least validated the server connection and successfully registered the ActiveSync ID with SMC, in the log file at least. It still needed manually copying to the SMC Web UI because of the "[known error](https://warlord0blog.wordpress.com/2018/01/25/sophos-mobile-control-eas-proxy)". But it was failing to sync.

## Outlook 365 ActiveSync Debug Logging

***"To boldly go where no man has been before"*** This article answered the how, but failed miserably at being helpful. [https://support.microsoft.com/en-us/help/2461792/how-to-collect-activesync-device-logs-to-troubleshoot-sync-issues-betw](https://support.microsoft.com/en-us/help/2461792/how-to-collect-activesync-device-logs-to-troubleshoot-sync-issues-betw) I tried method 1 with the portal approach and when I clicked the icon to retrieve the log it came up with a not very helpful error message "*There was a problem saving your changes. If the problem continues, contact support.*" ![Capture](/blog-media/2018/01/capture.png) So I carried on to method 2. Which is a lot more helpful, if you have any PowerShell experience, unlike me. But I persevered and got connected.

    PS C:\> Set-ExecutionPolicy RemoteSigned

    PS C:\> $UserCredential = Get-Credential
    PS C:\> $Session = New-PSSession -ConfigurationName Microsoft.Exchange -ConnectionUri https://outlook.office365.com/powershell-liveid/ -Credential $UserCredential -Authentication Basic -AllowRedirection
    PS C:\> Import-PSSession $Session

    PS C:\> Set-CASMailbox forename.surname@domain.tld -ActiveSyncDebugLogging:$true 
    PS C:\> Get-MobileDeviceStatistics -Mailbox forename.surname@domain.tld -GetMailboxLog:$true -NotificationEmailAddresses "forename.surname@domain.tld"

But when I tried to retrieve the logs I got more information about what devices were configured, but I still got a nice big red error message.

    The Exchange ActiveSync mailbox log couldn't be processed: Logs couldn't be retrieved for your mobile device. Make
    sure your mobile device is synchronizing with Exchange before you start logging again and try to retrieve the logs. If
    the problem continues, contact your email admin.
        + CategoryInfo          : NotSpecified: (LegacyDn: /o=Ex...00-000000000000:UserPrincipal) [Get-MobileDeviceStatist
       ics], MobileDeviceLogException
        + FullyQualifiedErrorId : [Server=LO1P123MB0082,RequestId=bbc49780-b84f-4cc0-a0f5-a32db2ba8474,TimeStamp=26/01/201
       8 11:06:23] [FailureCategory=Cmdlet-MobileDeviceLogException] D7D8BDB,Microsoft.Exchange.Management.Tasks.GetMobil
      eDeviceStatistics
        + PSComputerName        : outlook.office365.com

After some double checking of the device a colleague pointed out that I'd chosen to use SSL/TLS, accept any certificate. This couldn't be the issue, surely. But setting it to SSL/TLS only and starting the sync it all worked as it should! So the stupidly misleading error messages from the ActiveSync logging were actually trying to tell me that there was no log to collect, because the device wasn't connecting. So in all a frustrating process to get back to the same position we already had with the previous version of Exchange. But I now had a 100GB mail box limit, instead of the 500MB we had online. The next challenge is figuring how we limit the necessary caching of those mailboxes to an OST held in a users profile - especially as we're having to continue with Office and Outlook 2010 for the majority of users due to business application support.
