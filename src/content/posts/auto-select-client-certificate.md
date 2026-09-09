---
pubDatetime: 2020-10-23T07:00:13Z
modDatetime: 2020-10-23T07:01:25Z
title: "Auto Select Client Certificate"
tags:
  - "certificates"
  - "Web"
description: "When you visit a site requiring a client certificate you'll be presented with a dialog to select a certificate to use. This is awkward in a kiosk scenario"
---
When you visit a site requiring a client certificate you'll be presented with a dialog to select a certificate to use. This is awkward in a kiosk scenario where a user may not be present to select the certificate or can't select the certificate because it is on a second screen.

To make it happen automatically you need to set a chrome or chromium policy. Policy files are held in the following locations:

|          |                                  |
|----------|----------------------------------|
| Browser  | Location                         |
| Chrome   | /etc/opt/chrome/policies/managed |
| Chromium | /etc/chromium/policies/managed   |

The json policy file we need to create contains:

```
{
  "AutoSelectCertificateForUrls": [
    "{\"pattern\":\"*\",\"filter\":{\"ISSUER\":{\"CN\":\"MyCA\"}}}"
  ]
}
```

It doesn't look right as it's a string of json inside json, but this is the way it works.

```
sudo mkdir -p /etc/chromium/policies/managed
sudo vi /etc/chromium/policies/managed/policies.json
```

Replace MyCA with the name of the CA Issuer that you want to automatically send.

You can verify the policies are loaded using the address [chrome://policy](//policy) in the browser.
