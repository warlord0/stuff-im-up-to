---
pubDatetime: 2017-09-28T13:57:55Z
title: "Forcing Tomcat to HTTPS"
tags:
  - "apache"
  - "tomcat"
  - "Web"
heroImage: "/blog-media/2017/01/2000px-tomcat-logo-svg-e1485850229861.png"
description: "As our environment needs change more and more of our internal services are being forced to change to HTTPS. Tomcat supports the deployment of services usin"
---
As our environment needs change more and more of our internal services are being forced to change to HTTPS. Tomcat supports the deployment of services using HTTPS, but many of our vendors have taken the easy route and just use HTTP on the standard port 8080. This is now going to become a bit of a hurdle as we now need to advise clients of the change to HTTPS and the port change involved. Securing Tomcat with valid certificates is the start of the journey and adding a connector using HTTPS is the first step. Then we need to make calls to the non-secure HTTP site redirect over to the HTTPS version. In the Tomcat `conf/server.xml` file we're specifying that a need for a secure connection requires redirection to another service. On the connector this is in the form:

    redirectPort="8443"

This doesn't actually do anything unless the underlying page has some security constraint requiring it. As per the Tomcat connector documents:

> **redirectPort **If this Connector is supporting non-SSL requests, and a request is received for which a matching requires SSL transport, Catalina will automatically redirect the request to the port number specified here.

So now we need to make all of our calls to any URL require security. Edit the `conf/web.xml` file and add in at the very end, but before the closing web-app tag the following:

    <!-- Force all visits to require to be secure and therefore redirect to https -->
    <security-constraint>
      <web-resource-collection>
        <web-resource-name>Entire Application</web-resource-name>
        <url-pattern>/*</url-pattern>
      </web-resource-collection>
      <user-data-constraint>
        <transport-guarantee>CONFIDENTIAL</transport-guarantee>
      </user-data-constraint>
    </security-constraint>

Now any visit to the 8080 service to any URL will trigger a need to be secure and then redirect over to the HTTPS port on 8443. Of course you may also want to make this a simple HTTPS default port 443 rather than the 8443. You could then just change the `port=8443` to `port=443` in the `conf/server.xml` file. References: [https://www.journaldev.com/160/steps-to-configure-ssl-on-tomcat-and-setup-auto-redirect-from-http-to-https](https://www.journaldev.com/160/steps-to-configure-ssl-on-tomcat-and-setup-auto-redirect-from-http-to-https)
