---
pubDatetime: 2016-10-26T18:53:06Z
modDatetime: 2016-10-28T17:49:54Z
title: "Nginx, Not Just a Web Server"
tags:
  - "Linux"
  - "Networking"
  - "nginx"
  - "proxy"
description: "Nginx is capable of more than serving web pages. It can load balance, cache and act as a reverse proxy. We recently had need to access two web services on"
---
Nginx is capable of more than serving web pages. It can load balance, cache and act as a reverse proxy. We recently had need to access two web services on the same server through a single interface. This is where the reverse proxy came in.

- Service A runs on port 9010
- Service B runs on port 9020
- Access to both services needs to be via a single front end using traditional http over port 80

Not ideal, but it's not my system design, just a challenge we need to face. The way we tackled it was using an Nginx reverse proxy and split the calls to specific URL paths on each web service to the relevant underlying back end service. Actually making Nginx act as a proxy is no more difficult than serving a web page. A quick modification in the /etc/nginx/default.conf file can easily identify a location and direct it as necessary.

    server {
        listen       80;
        server_name  server.domain.tld;

       location ~ ^/(path1|path2|path3)(.*) {
           proxy_pass http://192.168.0.70:9010/$1$2?$query_string;
           proxy_redirect http://192.168.0.70:9010/ /;
        }

        location ~ ^/(path4|path5)(.*) {
           allow X.X.X.X;
           deny all;
           proxy_pass http://192.168.0.70:9020/$1$2?$query_string;
           proxy_redirect http://192.168.0.70:9020/ /;
        }
    }

The important parts in this config snippet are:

> location ~ ^/(path1\|path2\|path3)(.\*) {

Use a regular expression to split the URL where the url path begins with path1, path2 or path3, pass it to a backend server specified as `proxy_pass http://192.168.0.70:9010/$1$2;` and pass it the regex groups \$1 (the path) and \$2 (everything after the path). Then when the backed server returns anything that may redirect to the client to use the configure URL directly, replace the `http://192.168.0.70:9010/` in the redirect with just a `/` so the redirection comes back to the proxy and not try to use the direct URL. So now anything going to http://server.domain.tld/path1...3 will be proxied to http://192.168.0.70:9010/path1...3 Similarly the next location block causes anything going to http://server.domain.tld/path4...5 to be proxied to http://192.168.0.70:9020/path4...5, but will only be allowed from the IP address X.X.X.X and denied from anywhere else. Obviously the two services are so completely different that the paths are not the same on both services. eg. you can't have path1 on service A and path1 on service B, but in this instance they are so different as to make this possible. The client browser is now able to browse using simple http and no port like :9010, :9020 specified that could tangle them up. A more realistic example may be to view 9010 as a web content server and 9020 as an api service. So more like

    location ~ ^/(js|css|image)(.*) {

and

    location ~ ^/(api)(.*) {

Then using a simple call to one front end I can call the paths for content and api and get the results seemingly from one URL. eg.

    http://server.domain.tld/image/banner.png
    http://server.domain.tld/css/main,css
    http://server.domain.tld/api/getdata
