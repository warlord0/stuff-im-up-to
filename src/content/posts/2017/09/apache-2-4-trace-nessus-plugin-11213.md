---
pubDatetime: 2017-09-21T12:51:56Z
modDatetime: 2017-09-21T14:49:59Z
title: "Apache 2.4 TRACE - Nessus plugin 11213"
tags:
  - "apache"
  - "nessus"
  - "Security"
  - "Web"
heroImage: "/blog-media/2016/10/nessus-logo-e1475580279964.png"
description: "If you're using Apache 2.4 then there is a config TraceEnable directive that you should use to simply turn off the TRACE method."
---
Googling for how to close the vulnerability for the TRACE method on Apache 2.4 results in lots of responses that just use a rewrite rule to respond with a permission denied message.  Even the Nessus plugin output lists the rewrite fix. Nessus doesn't use this for it's scans, it carries out a HTTP call for OPTIONS and relies on the server telling it what methods are available.

    RewriteEngine On 
    RewriteCond %{REQUEST_METHOD} ^(TRACE|TRACK)
    RewriteRule .* - [F]

Whilst the rewrite rule may be a valid mitigation on Apache servers, the actual vulnerability warning won't be removed from Nessus' results.

> If you're using Apache 2.4 then there is a config `TraceEnable` directive that you should use to simply turn off the TRACE method.

Edit your `http.conf` and add into it the `TraceEnable off` directive.

### httpd.conf

    ...
    TraceEnable off
    ...

To confirm the change is effective, without having to wait for a full rescan using Nessus, use `nmap` to get the results. Before the TraceEnable added you'll see the TRACE method enabled.

    $ nmap -p 443 --script http-methods server

    Starting Nmap 7.40 ( https://nmap.org ) at 2017-09-21 13:32 BST
    Nmap scan report for server (192.168.0.187)
    Host is up (0.00031s latency).
    rDNS record for 192.168.0.187: server.domain.local
    PORT    STATE SERVICE
    443/tcp open  https
    | http-methods: 
    |   Supported Methods: POST OPTIONS HEAD GET TRACE
    |_  Potentially risky methods: TRACE

    Nmap done: 1 IP address (1 host up) scanned in 0.25 seconds

After you don't see the TRACE method listed.

    $ nmap -p 443 --script http-methods server

    Starting Nmap 7.40 ( https://nmap.org ) at 2017-09-21 13:36 BST
    Nmap scan report for server (192.168.0.187)
    Host is up (0.00059s latency).
    rDNS record for 192.168.0.187: server.domain.local
    PORT    STATE SERVICE
    443/tcp open  https
    | http-methods: 
    |_  Supported Methods: GET POST OPTIONS HEAD

    Nmap done: 1 IP address (1 host up) scanned in 0.25 seconds
