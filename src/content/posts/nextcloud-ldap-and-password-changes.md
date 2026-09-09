---
pubDatetime: 2020-05-14T10:52:43Z
title: "Nextcloud, LDAP and Password Changes"
tags:
  - "ldap"
  - "Linux"
description: "Using Nextcloud with LDAP is straight forward enough, you just add in the \"LDAP user and group backend\". We wanted to use Nextcloud to enable our LDAP user"
---
Using Nextcloud with LDAP is straight forward enough, you just add in the "LDAP user and group backend". We wanted to use Nextcloud to enable our LDAP users to change their own password, and this is where things go sticky.

Our Nextcloud was configured just how we like our other LDAP auth systems - with a readonly user that's able to bind and query only. Try as I might I could not get Nextcloud to change a users password, even though the user was granted write access to their own password in the LDAP ACL on the server.

There were a number of wider things to change before users could change their password, it wasn't just this use of a readonly binding.

## Fixing the Configuration

Set the server credentials under Settings \> LDAP / AD Authentication \> Server to a user that has admin or at least the ability to write to the user accounts. This comes in handy if you also want to create users via Nextcloud with the "Write Support for LDAP" app. Make sure you click "Save Credentials" or it will revert back to the previous setting.

In the top right click the "Expert" settings tab and change the "Internal Username Attribute:" to your systems unique user identifier - in our case it's `uid`, you may be using something else like `sAMAccountName` or even `mail` or `mailPrimaryAddress`.

If you've been running with some LDAP users already then the next part is what we burned many hours on. Everything a user went to change their password it would send a UUID style string to the LDAP server in place of their `uid`. This is because Nextcloud gives the user a unique UUID and maps it to their LDAP account. Then it users this UUID to identify the user.

We needed to clear this mapping so users where properly identified using the attribute (`uid`) that we set above. Click the "Clear Username-LDAP User Mapping" button and then you should find your users can now change their own passwords.
