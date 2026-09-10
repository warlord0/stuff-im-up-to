---
pubDatetime: 2017-09-20T10:31:11Z
title: "Android Trusted CA Certificate"
tags:
  - "android"
  - "Linux"
  - "proxy"
heroImage: "/blog-media/2017/09/android-logo-png.png"
description: "We have been tested by some of our Android Lollipop tablets. Adding a trusted CA certificate used to be as easy as visiting the proxy portal and clicking t"
---
We have been tested by some of our Android Lollipop tablets. Adding a trusted CA certificate used to be as easy as visiting the proxy portal and clicking the install certificate button. Now these devices come up with an error complaining that there is "no certificate in file". Reading a lot of Android nightmare posts about converting the PEM certificate to pfx/p12 using openssl and then rooting the device and delivering the certificate into the folder for the cacerts using the command line it turned out to be far simpler. The PEM file direct from the proxy portal is a simple text file that includes a lot of certificate header information. eg.

    Certificate:
        Data:
            Version: 3 (0x2)
            Serial Number:
                8f:1a:d3:f7:1d:1e:ce:ea
        Signature Algorithm: sha256WithRSAEncryption
            Issuer: C=uk, L=location, O=organisation, CN=certificate_name
            Validity
                Not Before: Sep 16 14:03:22 2015 GMT
                Not After : Nov 29 00:00:00 2018 GMT

This all preceded the `-----BEGIN CERTIFICATE-----` header. The simple solution was just to remove everything before this header, save the file onto the Android device as a crt file and open it in file manager. Presto it installed as a user CA certificate and now our proxy SSL interception works without the user being frustrated with security warnings whilst browsing.
