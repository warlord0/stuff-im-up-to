---
pubDatetime: 2017-02-23T15:04:15Z
modDatetime: 2017-02-25T10:35:41Z
title: "Teradici PCOIP Management Console"
tags:
  - "certificates"
  - "Linux"
description: "When it comes to upgrading the pcoip-mc it's a case of deploying a new OVA file into the VMware estate. This means you have to grab all the settings from y"
---
When it comes to upgrading the pcoip-mc it's a case of deploying a new OVA file into the VMware estate. This means you have to grab all the settings from your previous console and restore them into the new one. The backup and restore process isn't painful at all. It's all managed in the Web GUI. But if like me, you've used your own certificates for the server, you're going to need to make sure you have the current ones handy and in a form you can redeploy to the new one. For me this was a bit of a problem. I can't seem to locate my certificate and key files for some reason. So I thought let's try grabbing them from the pcoip-mc server itself. Turns out it's a Jetty server that uses the keys. Being Jetty that means Java. So time to find a Java keystore. I found `/opt/jetty/etc/keystore` almost immediately. Now to check out what's in there. I can use Java `keytool` for this and list the content of the keystore file using:

    # keytool -keystore /opt/jetty/etc/keystore -list -v

I'm then asked for a password! Well let's see... try the usual ones, changeit, password, `teradici` - bingo! If it had been anything else I'd have resorted to looking in `/opt/jetty/etc/jetty-ssl.xml` - and sure enough the password is in there anyhow. Not only that I don't need to know it really. I'm just copying the file and the new server uses the same keystore password. So all I have to do now is use scp to copy the keystore from my old pcoip-mc and then copy it onto the new on in the same place. Then restart the new server and like magic, it's now using the same certificate and key as the previous version. All I need to do is take down the old one, make sure the new one has the IP Address of the old one and then restore the database backup.
