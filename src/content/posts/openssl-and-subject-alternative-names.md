---
pubDatetime: 2017-07-27T14:08:39Z
modDatetime: 2017-07-27T14:11:00Z
title: "OpenSSL and Subject Alternative Names"
tags:
  - "certificates"
  - "Linux"
  - "ssl"
  - "Windows"
description: "Now that Google chrome has started bitching about certificates not having Subject Alternative Names because the practice of using Common Names in certifica"
---
Now that Google chrome has started bitching about certificates not having Subject Alternative Names because the practice of using Common Names in certificates has changed. So in order to get the SAN into a CSR you need to edit the OpenSSL config file you're using for the request. You can spend time scripting something, but for the few times I do it I'll just copy the base `openssl.cnf` file to one specific to the CSR I need to create. After all you'll already have customised the `req_distinguished_name` section so you don't have to put in the country and company name all the time. eg.

    $ cp /etc/ssl/openssl.cnf ~/myserver.cnf

Then I just use that new `cnf` file as part of the command line to create the CSR.

    $ openssl req -out myserver.csr -new -newkey rsa:2048 -nodes -keyout myserver.key -config ~/myserver.cnf

The changes I made to the `cnf` file are create a section `alt_names` that are then used by the  section `v3_req`.

    [ v3_req ]
    subjectAltName = @alt_names

    [ alt_names ]
    DNS.0 = myserver.domain.local
    DNS.1 = myserver

Note the numerical suffixes to add more than one entry. Then make sure the `req_extentions` line in the `req` section is uncommented.

    [ req ]
    ...
    req_extensions = v3_req # The extensions to add to a certificate request
    ...

I guess it doesn't need to be so convoluted, I could probably put all that into the `req` section, but it works and means I can reuse the `cnf` file and just change the `alt_names` section.
