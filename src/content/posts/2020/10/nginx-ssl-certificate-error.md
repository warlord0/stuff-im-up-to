---
pubDatetime: 2020-10-14T20:00:53Z
modDatetime: 2020-10-14T20:14:03Z
title: "Nginx SSL Certificate Error"
tags:
  - "certificates"
  - "Linux"
  - "nginx"
  - "Web"
heroImage: "/blog-media/2016/09/2000px-nginx_logo-svg.png"
description: "We're using client side certificates on an Nginx host to ensure the credentials of the connecting users and haven't used the site for a while. I tried to l"
---
We're using client side certificates on an Nginx host to ensure the credentials of the connecting users and haven't used the site for a while.

I tried to logon with a known good client certificate and know that nothing on the site config has changed and all I get in return is a 400 error with the message "SSL Certificate Error", which is not at all helpful.

First I thought I'd regenerate my client certificate, no joy there. Still the same error. So I went through the process of verifying the CA cert matched my source and was still valid. Use openssl to verify my client certs, all looked good. Nothing I did allowed me to access the site unless I turned client certificate verification off.

```
ssl_verify_client off;
```

So what was my problem? I checked the `nginx.conf` and our logging was set to push out to a syslog server:

```
error_log syslog:server=logserver:515,severity=debug;
```

But I wasn't seeing anything in the log about any errors. I checked the syntax of the config entry and found it to be missing the debug option - confusing I know, it looks like it should be using debug logging, but that's just the severity setting for the syslog server, not Nginx. I added `debug` onto the end of the line:

```
error_log syslog:server=logserver:515,severity=debug debug;
```

Now I can see what the problem is with the certificates - there is no problem with the certificates, it's a problem with my certificate revocation list being too old! I just need to regenerate and reissue a new one.

```
<190>Oct 14 20:38:22 proxy3.domain.tld nginx: 2020/10/14 20:38:22 [info] 12373#12373: *83301603 client SSL certificate verify error: (12:CRL has expired) while reading client request headers, client: 81.8.151.23, server: server.domain.tld, request: "GET /favicon.ico HTTP/1.1", host: "server.domain.tld", referrer: "https://server.domain.tld/web/database/selector"
```

By using openssl I can check the validity of my crl using:

```
$ openssl crl -in crl.pem -text
Certificate Revocation List (CRL):
    Version 2 (0x1)
    Signature Algorithm: sha256WithRSAEncryption
    Issuer: CN = myCA
    Last Update: Oct 14 19:40:03 2020 GMT
    Next Update: Apr 12 19:40:03 2021 GMT
```

Now all I need to do is make sure I automate this process and dump a new crl onto the server at least every 6 months - I'll probably do it monthly to be sure.

## References

[https://www.djouxtech.net/posts/nginx-the-ssl-certificate-error/](https://www.djouxtech.net/posts/nginx-the-ssl-certificate-error/)
