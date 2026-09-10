---
pubDatetime: 2017-01-31T15:17:24Z
modDatetime: 2017-09-28T12:10:27Z
title: "Tomcat and HTTPS"
tags:
  - "certificates"
  - "java"
  - "Security"
  - "ssl"
  - "Web"
heroImage: "/blog-media/2017/01/2000px-tomcat-logo-svg-e1485850229861.png"
description: "By default Tomcat gets installed with HTTP only and a number of default applications. Previously I linked documents on how to secure Tomcat . But put simpl"
---
By default Tomcat gets installed with HTTP only and a number of default applications. Previously I linked documents on how to [secure Tomcat](https://warlord0blog.wordpress.com/2017/01/31/securing-tomcat/). But put simply just delete the folders under `webapps` that you don't need for your application. So you pretty much get left with `host-manager` and `manager` in there. My next step was to try to figure out how to get the connection changed from HTTP to HTTPS and apply a valid certificate to the connection.

## Prerequisites

In order to run Tomcat you need to have a Java JDK installed (not just the JRE). You can install this using the defaults but you must then have a `%JAVA_HOME%` environment variable set to point to the JDK location (not the JRE). eg. `JAVA_HOME=C:\Program Files\Java\JDK1.8_121`

## Tomcat Service

Rather than running an installer I copied the zip file to my server and extracted the files into `c:\tomcat`. This way I can control access to that location more directly and alter the service as required. Install the Tomcat service by using `bin/service install` and this will create the default Tomcat service. After the service is installed I then created a 'Local' user called `tomcatsvc` and changed the service permissions to run as this new user and make sure the user has read write access to `c:\tomcat`. This way at least if my Tomcat service is compromised it should only have local user permissions and not be an administrator. Make sure this service starts before you continue changing the config. At least at this point you should have a known good and working system.

## Tomcat/Java Certificates

As Tomcat uses Java for its certificate handling there is one tool you need to get your head around, and that is `keytool` you'll find it under the `bin` folder of your `%JAVA_HOME%`. This keytool allows you to create certificate stores and create keys, import and export certificates, and create csr's etc. One important thing to realise is Java has it's own keystore, it doesn't use the Windows keystore and it doesn't use the Linux keystore\*. Java comes with a public keystore that contains all the known good CA certificates. This is in a single file called `cacerts`. that resides in `%JAVA_HOME%\lib\security`.

- Not strictly true, but for the point of this post less assume not.

You can list the contents of the `cacerts` file using:

    c:\> %JAVA_HOME%\bin\keytool -list -keystore %JAVA_HOME%\lib\security\cacerts

You'll need to specify the default password for the file which is `changeit`. We could use this file for Tomcat and add our own keys and certificates to it, but let's create our own file and secure it using our own password. Also put it in a place we know is going to remain constant rather than the ever changing `%JAVA_HOME%` which is subject to change based on updates. If you ever tear down Tomcat and Java eg. to install new versions at least you'd still have the necessary certificates if you keep them in a separate folder!

### Create a New Store with a New Private Key

First thing to do is create a private key:

    c:\> keytool -genkey -keyalg RSA -keysize 2048 -alias [myserver] -keystore [c:\certs\keystore.jks]

Specify your own password for the file and give all the details for the certificate as per other certificates. Note the `-ext san=` part. This is so we can end up with a certificate that has both a valid alias AND a valid FQDN.

### Generate a CSR to Submit to the CA

In order to get a valid certificate we need to send a CSR to the CA server so we get back a signed certificate.

    c:\> keytool -certreq -alias [myserver] -keystore [c:\certs\keystore.jks] -file [c:\certs\myserver.csr] -san=dns:[myserver.domain.local],dns:[myserver]

Then submit your csr file to the CA server. If you're using a Windows CA you can visit `https://caserver/certsrv` and process and download your new certificate in Base64 format. Download the key chain as a p7b.

### Import your Certificate into the Keystore

    c:\> keytool -import -alias [myserver] -keystore [c:\certs\keystore.jks] -file [certnew.p7b]

By importing the p7b you should have the entire chain in the keystore. So it'll include your CA server certificate.

## Configuring Tomcat to use HTTPS

By default your Tomcat install will be listening on TCP port 8080. Now we want HTTPS we'll be adding TCP port 8443 to the server. Most of the config is already done for you and just needs uncommenting  from the config file. Edit the `conf/server.xml` file and search for the `Connector port="8443"` section. Remove the xml/html comment markers from around the section and make changes so it has these settings:

     keystoreFile="[C:/certs/keystore.jks]"
     keyAlias="[myserver]"
     keystorePass="[password]"
     SSLProtocol="TLSv1+TLSv1.1+TLSv1.2"

Note the additions for keystoreFile, keyAlias and keystorePass. For the keystoreFile with Windows you must reverse the slashes, replace back slashes with forward slashes. One other thing to add into this could be the ciphers you want to use.

    ciphers="TLS_ECDHE_RSA_WITH_AES_128_CBC_SHA256,
    TLS_ECDHE_RSA_WITH_AES_256_CBC_SHA384,
    TLS_RSA_WITH_AES_128_CBC_SHA256,
    TLS_RSA_WITH_AES_256_CBC_SHA256"

> **Note**: There are some subtle differences between Tomcat 7 and 8. The examples above are for Tomcat 7. For Tomcat 8 the SSL Protocol case changes and becomes only `sslProtocol="TLS"`. Also the ciphers list becomes the openssl style like `ciphers="HIGH:!aNULL:!eNULL:!EXPORT:!DES:!RC4:!MD5:!kRSA!DHE:!SHA"`

Make sure your Tomcat service user (`tomcatsvc`) has permission to at least read from the certificate directory (`c:\certs`). Restart the Tomcat service and you should now find you can access Tomcat using HTTP from your browser using `https://myserver:8443`. References: [https://www.sslshopper.com/article-most-common-java-keytool-keystore-commands.html](https://www.sslshopper.com/article-most-common-java-keytool-keystore-commands.html)

## Using the Windows Keystore

> Not tested, but it looks like you can use the Windows keystore. However, the certificate and key must reside in the "Personal" store of the user account running Tomcat. Which may not be much help if you're using Machine certificates.

    keyAlias="[myserver]"
    keystoreFile=""
    keystoreType="Windows-My"

By default the `keystoreType=jks`.
