---
pubDatetime: 2020-02-05T16:05:43Z
modDatetime: 2020-02-06T20:14:42Z
title: "Firefox Certificates"
tags:
  - "certificates"
  - "Linux"
description: "Now with added Chromium! Fun and games with Nginx and client authentication certificates means we need to deploy certificates to the user for them to trust"
---
> Now with added Chromium!

Fun and games with Nginx and client authentication certificates means we need to deploy certificates to the user for them to trust our CA and have a trusted personal certificate to validate with our server.

I can see why many just pop up a help page and navigate the user through importing the CA and their certificate in the browser. We need to make this a bit more automated though as the machines will be out with customers.

There's a lot of controversy over Firefox's certificate stores. Let's just stay out of that an inject or certificates using some command line tools.

The tools we need (`certutil` and `pk12util`) are part of the package `libnss-tools` which you may need to install first.

```
$ sudo apt install libnss3-tools
```

Once we have out tools we'll need the certificates we want to install. The public one for the Certificate Authority is generally straight forward and comes as a PEM formatted `.crt` file. If not, it's time to get down with `openssl` and convert it to a PEM version.

For the client certificate you'll need both the public and the private key. These will typically be separate PEM formatted files - probably a `.key` and a `.pem`. For this we will need to combine them into a single pkcs12 format file - so we will need to get down with `openssh` to do this.

```
$ openssl pkcs12 -export -inkey client01.key -in client01.pem -name Client01 -out client01.pfx
```

This will take both parts and convert them into a single `.pfx` file which we can then import into the certificate store.

Now for the fun part - finding your Mozilla certificate store. It will be in your profile, but it will have a string of random characters/digits in the path. eg.

```
~/.mozilla/firefox/hg8iqr94.default-esr
```

Hmm, but according to Mozilla your default profile folder will contain `.default` in the name. Not really that helpful - I decided to script the process and have it drop the certificates into any path listed in `~/.mozilla/firefox/profile.ini` certificate store that it finds. I'm sure this can be made more elegant, but it works.

```
#!/bin/sh

BASE=~/.mozilla/firefox

# Install certificates into Firefox profiles

for PROFILE in $(grep "Path=" $BASE/profiles.ini | sed s/Path\=//)
do
  echo Installing to $PROFILE
  certutil -A -i ca.crt -n MyCA -t "CT,C,T" -d $BASE/$PROFILE
  pk12util -i MyClient.pfx -n MyClient -d $BASE/$PROFILE -W $1
done
```

You'll want to edit this to include your password or pass it as a parameter and use \$1. It's also possible to use a lowercase option `-w` which will point to a file containing the password - which may be useful for some automation practices.

## ![undefined](/blog-media/2020/02/chromium.png) Chromium Certificates

Turns out I inadvertently stepped into a Chromium solution too. Whilst inserting certificates into Firefox I found a `~/.pki` folder that also contained a certificate store.

Then when I discovered many of the customer systems used Chromium I installed it for testing and put the certificates into the `~/.pki` folder using `certutil` and `pk12util` and it worked! Chromium now has the required certificates and works just as required.

```
$ certutil -A -i ca.crt -n MyCA -t "CT,C,T" -d ~/.pki
$ pk12util -i MyClient.pfx -n MyClient -d ~/.pki -W mypassword
```

A simple modification of the script and I can have both.
