---
pubDatetime: 2017-11-21T09:39:31Z
title: "PaperCut Certificate"
tags:
  - "certificates"
  - "Web"
  - "Windows"
description: "Time to replace the PaperCut web server certificate. So pleased I ran into Keystore Explorer previously as this made changing the web server certificate a breeze."
---
Time to replace the PaperCut web server certificate. So pleased I ran into Keystore Explorer previously as this made changing the web server certificate a breeze. Put simply you create a new keystore file, in the `Program Files\PaperCut MF\server\custom` folder, and import your certificate that you obtain from your internal CA. We did this using MMC and the Certificate snap-in on the print server. Then export the certificate with private key to a `.pfx` file. Then just import the `.pfx` into the new keystore in Keystore Explorer. Edit the `server.properties` file in `Program Files\PaperCut MF\server` and add the relevant keystore and password details.:

    ### SSL/HTTPS Configuration (Default: 9192) ###
    server.ssl.port=9192

    # Custom SSL keystore example (recommend placing in the custom directory)
    server.ssl.keystore=custom/my-ssl-keystore
    server.ssl.keystore-password=myPassword
    server.ssl.key-password=myPassword

Restart the PaperCut services, give it a minute and the user and admin portal should now be using the new certificate.

> https://printserver.domain.local:9192/admin

Now every printer that has an embedded PaperCut app will need to be updated to accept the new certificate. This means you have to visit each PaperCut admin console on every device - yes, that's the painful bit if you have a lot of printers. Then you login to the console and click apply, even though you've made no change. This will then ask you to accept and trust the new certificate. ![Selection_002](https://warlord0blog.files.wordpress.com/2017/11/selection_002.png)

## References

[https://warlord0blog.wordpress.com/2017/11/14/java-keystore-management/](https://warlord0blog.wordpress.com/2017/11/14/java-keystore-management/) [https://www.papercut.com/products/ng/manual/common/topics/tools-ssl-key-generation-certificate-authority-import-new.html](https://www.papercut.com/products/ng/manual/common/topics/tools-ssl-key-generation-certificate-authority-import-new.html)
