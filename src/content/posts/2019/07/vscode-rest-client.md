---
pubDatetime: 2019-07-15T12:15:28Z
title: "VSCode rest-client"
tags:
  - "Linux"
  - "Windows"
heroImage: "/blog-media/2019/07/restful-api-logo-for-light-bg.png"
description: "Now Postman is awesome, but I came across this really good rest-client plugin for VSCode. What makes it so good is that I can save the .rest or .http files"
---
Now [Postman](https://warlord0blog.wordpress.com/2018/08/21/postman-is-awesome/) is awesome, but I came across this really good [rest-client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client) plugin for VSCode.

What makes it so good is that I can save the `.rest` or `.http` files all in one place with my VSCode project and have them form part of my Git version tracking.

So when someone pulls my code they also get the sample REST commands.

One of our most notorious products requires SOAP calls. Now I can save a `.http` file that contains the syntax required.

```
POST http://{{host}}:{{port}}/lagan/services/FL HTTP/1.1
Content-Type: text/xml
SOAPAction: retrieveCaseDetails

<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/" xmlns:flt="http://www.lagan.com/wsdl/FLTypes" xmlns:wsse="http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd">
   <soapenv:Header>
    <wsse:Security>
    <!--
        <wsse:BinarySecurityToken>{{binary-token}}</wsse:BinarySecurityToken>
    -->
      <wsse:UsernameToken xmlns:wsse='http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-wssecurity-secext-1.0.xsd' >
        <wsse:Username>{{username}}</wsse:Username>
        <wsse:Password Type='http://docs.oasis-open.org/wss/2004/01/oasis-200401-wss-username-token-profile-1.0#PasswordText'>
           {{password}}
        </wsse:Password>
      </wsse:UsernameToken>
    </wsse:Security>
   </soapenv:Header>
   <soapenv:Body>
      <flt:FWTCaseFullDetailsRequest>
         <flt:CaseReference>XXXXXXXXXX</flt:CaseReference>
         <!--1 or more repetitions:-->
         <Option>all</Option><!-- all, core, eforms-r, eforms-rw, events, form, fullform, notes, tasks, workflow, interactions, eform-data -->
      </flt:FWTCaseFullDetailsRequest>
    </soapenv:Body>
</soapenv:Envelope>
```

CMD+SHIFT+R then runs my REST file and returns the response in a new tab/window.

Notice the same style of double `{{moustache}}` usage for Environment variables as Postman. I can edit my `settings.json` file and add in the environments I need.

```
    "rest-client.environmentVariables": {
        "$shared": {
            "port": "8080"
        },
        "testserver": {
            "host": "testserver",
            "username": "mytestuser",
            "password": "mysecret"
        },
        "liveserver": {
            "host": "liveserver",
            "username": "myrealuser",
            "password": "mysecret"
        },
    }
```

I can then switch environments (down in the bottom right) without modifying my `.http` file. This also ensures that whilst the variables are used in my files I am not including any passwords with my Git, so no data leakage.
