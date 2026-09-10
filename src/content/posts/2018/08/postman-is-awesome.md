---
pubDatetime: 2018-08-21T13:38:36Z
modDatetime: 2018-08-24T08:31:20Z
title: "Postman is Awesome"
tags:
  - "api"
  - "Web"
heroImage: "/blog-media/2018/08/postman.png"
description: "I'm in the process of testing and documenting my API's and up until yesterday I'd only used postman to test my responses gave me something back. But it's capable of so much more!"
---
I'm in the process of testing and documenting my API's and up until yesterday I'd only used postman to test my responses gave me something back. But it's capable of so much more! I can use it to generate the documentation for each call I make, publish it online and share it with colleagues. But I can also use it to carry out unit tests on my API calls. Which is awesome. Then I find I can use globals and environment variables to migrate my tests and documentation between development and production systems... which is even more awesome.

## Using Variables

This is documented here: [https://www.getpostman.com/docs/v6/postman/environments_and_globals/variables](https://www.getpostman.com/docs/v6/postman/environments_and_globals/variables) For my setup I put such test variables as required to locate data like a sample postcode or uprn into globals. Then the same variables are used in all environments like development and production. In my environment variables I keep to a minimum only what is different for that environment. I'll have at least two environments, development and production, because my dev system will have a different url and authentication than the production system. Each of the environments will have variables for a user name and password to test with, and the url I want to use. In my POST/GET calls I don't include the actual url. I put in an environmental variable. eg.

    POST {{url}}/api/auth/login

This way my url gets replaced dynamically when I switch environments. So I just create a development environment where the url is set to `http://localhost:8000` and a production environment where the url is set to `https://server.domain.local`. Same tests, sames posts etc. Just a quick change of environment and I'm now running test on my live system!

## Testing with API Authentication

My API's are using bearer authentication with JWT. So in order to test things out I need to login, pick up the token from the response header and add it into the calls I make to test the API's with. No problem. With the **Tests** functions in Postman I can add some code that not only expects responses to meet certain criteria, I can also use the responses to update variables to carry over into other API tests in the same environment.

    pm.test('Response OK', function() {
        pm.response.to.be.ok
    })

    pm.test('Authorization Header is present', function() {
        pm.response.to.have.header('Authorization')
        pm.environment.set('bearer-token', postman.getResponseHeader('Authorization'))
    })

    pm.test('Status of success', function() {
        pm.response.to.have.jsonBody("status", "success")
    })

First test determines if my response code is status code 200, which is OK. Second test checks the Authorization header is present and sets an environment variable to the headers value. Now when I use another API as long as I include the Authorization type as bearer and put in the token `{{bearer-token}}` it will use this token and I'll be able to do authenticated API tests - at least until this token expires. Finally I test the response data in json and has content `{ "status": "success" }`

## Documentation

As long as I fill in descriptions in the Postman app my documentation will automatically be created and updated dynamically as I change my Postman project. Using variables like above also ensures my documentation stays free of specific example content - like my usernames and passwords, or other personally identifiable test data that are passed as parameters. In the docs they'll just show up as the parameter eg. `{{password}}`. ![Selection_075](/blog-media/2018/08/selection_075.png) Postman API documentation It'll even show me examples of how to use it from languages like jQuery, Node, PHP etc. If I use the publish button on the web site I can give the generated url to my colleagues who can see how my API works. Even after I've made a request and received a response I can save that response into the documentation as an example of what to expect to be returned from the API.

## Postman Testing with SOAP XML

As one of the systems we use is a SOAP WSDL API it needs XML sending and returns XML. We needed a way to validate the response includes the data we're looking for. In particular when we call the authentication process we needed to grab a security token and set an environment variable. Then we can use the environment variable to pass as the authentication SOAP Header. The process I used was to check the header returns the `Content-Type` as `text/xml` and then convert the XML to json using the built in Postman function `xml2Json()`. Once converted to json I can grab the token, set the variable and make sure it's not set to null.

> Notice how the SOAP Envelope is referenced as a json object using square bracket notation due to the colon's in the key name eg. `['soapenv:Envelope']`

    pm.test('Response is OK', function() {
      pm.response.to.be.ok
    })

    pm.test('Is XML and Has Binary Token', function() {
      pm.response.to.have.header("Content-Type", "text/xml;charset=utf-8");
      var json = xml2Json(pm.response.text())
      var token = json['soapenv:Envelope']['soapenv:Header']['wsse:Security']['wsse:BinarySecurityToken']._
      pm.environment.set('binary-token', token)
      pm.expect(token).not.to.eql(null)
    })

Now I can add the `{{binary-token}}` variable to my SOAP request and maintain the authentication.
