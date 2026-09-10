---
pubDatetime: 2016-10-05T18:02:28Z
modDatetime: 2016-10-05T18:07:49Z
title: "MSSQL Server SSL Certificate"
tags:
  - "certificates"
  - "mssql"
  - "ssl"
  - "Windows"
heroImage: "/blog-media/2016/10/mssql_logo.png"
description: "Having updated the CA certificate it's time to start rolling out the new SHA-256 algorithm to the other Windows servers. Group Policy (GPO) takes care of t"
---
Having updated the CA certificate it's time to start rolling out the new SHA-256 algorithm to the other Windows servers. Group Policy (GPO) takes care of the new CA certificate distribution and the clients and servers are getting that in their Trusted Root stores automatically. But the servers have a range of certificate expiry dates and won't  expire for some time. So to satisfy the vulnerability scan results we're having to update each server as we get to them. This means visiting each server running MMC, adding in the Certificate Snap-in for the Local Computer and then renewing the certificate(s). Once that's done it's a case of telling the applications to use the new certificate. Typically this means choosing the certificate in the Terminal Services Session Host management console, setting IIS to use the new certificate and updating SQL so that uses the new certificate too. Changing/setting SQL certificates can be a bit of a frustration. The best tip is if you Google look for the instructions that deal with an SQL cluster and making a registry change. Although it's about a cluster it's still the same process. In order to get SQL to use a certificate you need to:

1.  Make sure the certificates "private" key is exportable
2.  Have the correct permissions to the "private" key

If you can't export the private key from MMC then you'll probably have to modify the template that was used to issue the certificate on the CA. Then you'll have to renew the certificate again. In order to have the correct permissions on the privcate key you'll first need to know what user account the SQL service runs as. This may be the SYSTEM or NETWORK SERVICE account, or if you've setup a domain account eg. DOMAIN\SQLSERVICE, then you'll need to make sure it has permissions for the private key. Find the user the SQL service runs as by using services.msc or in the SQL Configuration Manager. Then in MMC right click your new certificate and choose All Tasks, Manage Private Keys... If you don't see the SQL service account in the list of users with permission you'll need to add it and give it the "Full control" permission. ![pki01](/blog-media/2016/10/pki01.png) ![pki02](/blog-media/2016/10/pki02.png) Whilst you're in MMC you'll want to copy the thumbprint of the certificate. Just double click the certificate and go to the Details tab. It should be right down the bottom of the list. Highlight the thumbprint and copy it from the display using CTRL+C. ![pki03](/blog-media/2016/10/pki03.png) Open Notepad and paste in the thumbprint you copied. Remove all the spaces as we need it in one string. Use CTRL+H to do a replace. Then copy it all as is now without the spaces. **NOTE**: Sometimes this includes a hidden unicode character at the beginning. If this is the case then the SQL service will fail. I double check this by opening a command prompt and pasting it there. If it shows up with a ? at the beginning you'll need to copy it again without the ?.

    C:> ?‎9ee6ba9627e88e80cefccbb719fd081dbb2f301d

If you've got it right we can now go and paste this into the registry. So open regedit and open the key as follows:

    HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Microsoft SQL Server\MSSQL.x\MSSQLServer\SuperSocketNetLib

Where MSSQL.x would be the version of MSSQL you are running. Then paste in the thumbprint you have copied into the "Certificate" value. Now you have 1) an exportable key 2) the private key permissions correct and 3) the thumbprint in the registry, you can go into the MSSQL Configuration Manager or services.msc and start the SQL service. If it fails check the event logs - it'll pretty much be because one of the 3 things here is wrong. So double check everything.
