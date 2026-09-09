---
pubDatetime: 2018-08-17T09:21:28Z
modDatetime: 2018-08-17T14:14:57Z
title: "Laravel and Lagan Web Services - SOAP API"
tags:
  - "Laravel"
  - "php"
  - "soap"
  - "Web"
description: "SOAP is a dirty word to me. But I have a need to interact with our CRM system to import / extract data. My go to platform for most of my PHP work is Larave"
---
SOAP is a dirty word to me. But I have a need to interact with our CRM system to import / extract data. My go to platform for most of my PHP work is Laravel. So I looked at interacting with Lagan CRM using SOAP calls from PHP. I started off accessing the Lagan WSDL pages to see what the capabilities of the API are.

    http://[laganserver:8080]/lagan/services/FL?WSDL
    http://[laganserver:8080]/lagan/services/FLAuth?WSDL
    http://[laganserver:8080]/lagan/schema/FLService.wsdl

Now I can see the self documenting API calls I can make. I just need to create the SOAP envelope to pass data to the service with the call I want to make. To turn this into something I can use in Laravel I created a controller that has the capability to create the SOAP envelope, add the authentication header, structure the body with the Lagan type relating to my SOAPAction and POST the request. https://gist.github.com/warlord0/3b000a06734158f3c27445d08b8a12a2 The special problems I encountered were generating XML without the `xml version` header and removing the `xmlns:lgn="lgn"` namespace declarations that get added in during the build process of a SimpleXMLElement. I know there's a SOAP client available in PHP and maybe longer term it's something to look at, but I struggled to understand it. Hence my use of SimpleXML. In order to solve those issue I used `dom_import_simplexml()` to remove the `xml version` header and then used a regex search to remove the `xmlns` attributes. This provided a clean XML (`$cleanXML`) that works as a valid SOAP envelope to tell the Lagan API what I am asking for. With a clean XML string I can send that to my Lagan server using a GuzzleHttp POST request and include the Content-Type and SOAPAction headers. In my Gist above I'm using a call to `retrieveCaseDetails` a function name that matches the Lagan API SOAPAction. The Guzzle client response then returns the XML SOAP response from Lagan and I can now process that XML to do what I need with the data.

## Version 2

During the course of the day I decided that using SimpleXMLElement was going to be too restrictive creating a reusable SOAP Envelope. I wanted something that would allow me to build the XML and include other XML objects as children. SimpleXML won't do that. A popularly downloaded XMLBuilder called Oxymel seems to fit the gap. It uses a DOM builder and as such doesn't have the namespace issues I had to correct in version 1. Using [Oxymel](https://packagist.org/packages/nb/oxymel) I'm able to build the XML tag by tag and use namespaces without the issue of validation under SimpleXML. I'm also able to add another Oxymel object as a child along the way. My use of `searchForCases` is flexible enough to be passed different parameters for the `FWTCaseSearch` type. Now I can have my own function `searchForOpenCases` that passes the Status = open parameter to `searchForCases`, which is now reusable. https://gist.github.com/warlord0/b061a5f5513c5427e36ef8161f0c824c
