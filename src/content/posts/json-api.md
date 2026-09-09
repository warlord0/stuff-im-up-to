---
pubDatetime: 2016-09-13T19:35:14Z
modDatetime: 2016-09-19T09:44:10Z
title: "Json:api"
tags:
  - "JavaScript"
  - "json"
description: "Having an API so others can interface with your product is one thing. But having a poorly deployed one doesn't do you any favours. It's almost as if no one has looked around to see what best practices or standards that are already out there."
---
I've been working on an interface to a cloud based ITSM and whilst I'm not a programmer it's given me an opportunity to expand my knowledge of PHP and JavaScript. It's also made me realise that even not being a programmer how even those that are should do better. Having  an API so others can interface with your product is one thing. But having a poorly deployed one doesn't do you any favours. It's almost as if no one has looked around to see what best practices or standards that are already out there. This is when I stumbled onto [json:api](http://jsonapi.org/). Retrieving data from the ITSM, modifying it and passing it back is just fraught with danger. Using a standards based approach like json:api would certainly sort it. Initially my frustrations with the ITSM API were that I didn't get back a consistent response. If my data query was successful the response returned was json. But if something went wrong I'd get back xml, or even worse xml with a CDATA attribute that contained escaped json! So somehow I was expected to determine what went wrong using an unexpected return type. Not great. After several forum posts I discovered that my api call to the ITSM was asking for the mime-type 'application/json', but should have been 'text/json'. So a simple mime-type, even syntactically correct, was enough to cause their api to act in such an unusual manner. So in future, if you're developing an api, please check out some best practice and accepted standards - you could do a lot worse than using the json:api and content type 'application/vnd.api+json' at least then I don't have to go on a fishing trip to figure out what data I'm getting back. **Edit:** Oh well that's just classic. I've just discovered that the api in fact delivers json when requested properly, but now I also find that one of the json parameters it returns is a string that is itself in need of decoding because that string is in fact json! json embedded json.

    {status: 'ok',
        data: "{name:'John Smith',address:'12 High St'}"
    }
