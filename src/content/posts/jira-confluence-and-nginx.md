---
pubDatetime: 2018-09-15T14:18:27Z
modDatetime: 2018-09-19T14:59:33Z
title: "JIRA, Confluence and Nginx"
tags:
  - "Linux"
  - "nginx"
  - "proxy"
  - "Web"
heroImage: "/blog-media/2018/09/58480948cef1014c0b5e48fd.png"
description: "With Atlassian Jira Software and Confluence installed onto the same server I thought I'd investigate setting things up so we don't have to use the default"
---
With Atlassian Jira Software and Confluence installed onto the same server I thought I'd investigate setting things up so we don't have to use the default TCP port type of access over HTTP. instead let's setup a reverse proxy using HTTPS over TCP 443 that forwards to the TCP 8080 and 8090 ports. The aim is to get Jira accessible as `https://jira.domain.local` and Confluence as `https://jira.domain.local/confluence`. This is actually a supported and well documented practice ([albeit with Apache](https://confluence.atlassian.com/adminjiraserver073/integrating-jira-with-apache-using-ssl-861253896.html)), but I encountered some issues outside of the documentation. The benefit of using a reverse proxy like this is that we have a single SSL certificate to maintain for Nginx only rather than for each application. Setting up the Nginx side was pretty straight forward. I generated an SSL certificate and installed it into the Linux OS and set Nginx to serve and proxy from port 80 and 443.

## Nginx Config - conf.d/jira.conf

    server {
        listen 80 default_server;
        listen [::]:80 default_server;

        # Redirect all HTTP requests to HTTPS with a 301 Moved Permanently response.
        return 301 https://$host$request_uri;
    }

    server {
        listen 443 ssl http2;
        listen [::]:443 ssl http2;

        # certs sent to the client in SERVER HELLO are concatenated in ssl_certificate
        ssl_certificate /etc/ssl/certs/jira.pem;
        ssl_certificate_key /etc/ssl/private/jira.key;
        ssl_session_timeout 1d;
        ssl_session_cache shared:SSL:50m;
        ssl_session_tickets off;

        # This *MUST* match your Confluence upload size of 100MB
        client_max_body_size 100M;

        # modern configuration. tweak to your needs.
        ssl_protocols TLSv1.2;
        ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256';
        ssl_prefer_server_ciphers on;

        # HSTS (ngx_http_headers_module is required) (15768000 seconds = 6 months)
        add_header Strict-Transport-Security max-age=15768000;

        # OCSP Stapling ---
        # fetch OCSP records from URL in ssl_certificate and cache them
        ssl_stapling on;
        ssl_stapling_verify on;

        ## verify chain of trust of OCSP response using Root CA and Intermediate certs
        ssl_trusted_certificate /etc/ssl/certs/myca.pem;

        resolver 192.168.0.55;

        location / {
            proxy_pass http://jira.domain.local:8080;
        }
        location /confluence {
            proxy_pass http://jira.domain.local:8090;
        }

    }

The point of interest here is the use of an internal CA to generate the certificate. So in order to satisfy OSCP I had to also install my CA certificate (see [Trusting CA Certificates](https://warlord0blog.wordpress.com/2016/09/22/trusting-ca-certificates/)). This becomes relevant later as we must also do the same thing for Java. With Nginx configured the proxying works but Jira/Confluence will complain about the URL not matching the config as it's still expecting the 8080, 8090 etc. So by following the guidance and editing the two `server.xml` files to change the context path and connection parameters this issue is resolved. Put simply I added a line inside the connector tag:

    proxyName="jira.domain.local" proxyPort="443" scheme="https" secure="true"

When restarted a visit to the Jira pages will expect you to go and change the Base URL to match the new addresses. `http://jira.domain.local:8080` becomes `https://jira.domain.local` `http://jira.domain.local:8090` becomes `https://jira.domain.local/confluence`

## Self Signed or Untrusted Certificate

Now when you visit Jira or Confluence it will complain about a failed Application Link. In our case this is because the Nginx certificate whilst trusted by Linux is not known to be issued from a trusted CA. So we must tell both Java/JRE instances for Jira and Confluence that they need to trust the issuing CA certificate. To add the trusted certificate to Java is the same process as [Java Certificates](https://warlord0blog.wordpress.com/2017/01/30/java-certificates/). The difference being that they each have their own instance of Java and each has their own `cacerts` file. So we need to add my CA cert into both files using the Java keytool and then restart Jira and Confluence.

    $ cd /opt/atlassian/jira/jre
    $ sudo bin/keytool -v -import -alias MyCA -file /etc/ssl/certs/myca.pem -keystore lib/security/cacerts

    $ cd /opt/atlassian/confluence/jre
    $ sudo bin/keytool -v -import -alias MyCA -file /etc/ssl/certs/myca.pem -keystore lib/security/cacerts

- You'll need the cacerts password = changeit

## Outbound Proxy

As all our systems use an outbound proxy we needed to add this into our config so we could access the Market Place and licensing system. This is another well documented process: [How to Configure an Outbound HTTP and HTTPS Proxy for JIRA applications](https://confluence.atlassian.com/jirakb/how-to-configure-an-outbound-http-and-https-proxy-for-jira-applications-247857187.html) I had some success with this process editing the `setenv.sh` file, but what solved it more easily for me was to edit each of the products `catalina.properties` file and append the following:

    http.proxyHost=192.168.0.117
    http.proxyPort=8080
    https.proxyHost=192.168.0.117
    https.proxyPort=8080
    http.nonProxyHosts=localhost|jira.domain.local

## Confluence File Uploads Failing

After using Confluence for a while I found that I was getting an error message when trying to upload a large file - greater than 20MB. In the Confluence config I know this is set to 100MB, so where's the problem?

> **Invalid response received from the server**

Nginx is set to only allow 20MB files by default. I had to add the following into either the server section of `nginx.conf` or the `conf.d/jira.conf` file:

    client_max_body_size 100M;

- Ensure it matches the size set in your Confluence settings (General Settings \> Attachment Maximum Size). Default 100MB.
