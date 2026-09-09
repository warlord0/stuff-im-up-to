---
pubDatetime: 2016-11-07T12:41:19Z
title: "HATEOAS"
tags:
  - "Web"
description: "Ok so what's that all about? I ran into an application deployment that is giving me some grief on deploying it through our security systems. The vendor cam"
---
Ok so what's that all about? I ran into an application deployment that is giving me some grief on deploying it through our security systems. The vendor came back with the response that our systems needed to support HATEOAS and that they'd be manipulating the HTTP headers as per the requirement of their RESTful API calls to our internal systems. It was all a bit foreign to me. Turns out [HATEOS](https://en.wikipedia.org/wiki/HATEOAS) is an abbreviation for "Hypermedia As The Engine Of Application State" which is quite a mouthful. In practice what they are trying to achieve is a common "front door" to a web application that uses several back end services which are directly delivered to the client as transparently as possible. So the client visits a single URL and the page content is delivered from back end services that the client need not concern themselves with. The content from the back end services uses the calls to it's API to respond based on headers called by the "front door". eg. Client visits https://www.frontdoor.tld and content is delivered from various sources like http://service.mydomain.co.uk:9010 and http://service.mydomain.co.uk:9020 But to keep the relationship of the calls from the front door headers are added so the service API's know where this is all coming from. So the "front door" adds an "X-Forwarded-Host" header with the value "www.frontdoor.tld"

    X-Forwarded-Host: www.frontdoor.tld

So now the service API's know the client is calling the API from a known entry point. This entry point can be used to construct the reply. One possible way a different entry points can call the same API with different results. The vendor just has to be careful what headers to manipulate. We fell foul of them using the regular Host: header which causes a major issue as this is used by the proxy server to determine what the client is asking for. Having them change to use X-Forwarded headers soon resolved this.
