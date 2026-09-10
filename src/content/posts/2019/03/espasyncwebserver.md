---
pubDatetime: 2019-03-28T09:56:55Z
modDatetime: 2019-03-28T20:14:42Z
title: "ESPAsyncWebServer"
tags:
  - "arduino"
  - "Privateer"
  - "Web"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "This is a great ESP8266 component that greatly simplifies the deployment of a web server. It's very capable and can handle websockets, compressed files and"
---
This is a great ESP8266 component that greatly simplifies the deployment of a web server. It's very capable and can handle websockets, compressed files and compared to other ESP web servers is streets ahead in terms of performance and abilities - *It's not without it's challenges though.*

One challenge in particular is the use of the [ArduinoJson](https://arduinojson.org/) module. Or more correctly the use of ArduinoJson v5, when the most current is v6. As I discovered When I needed the AsyncJson functions, I found that I was using ArduinoJson v6 by default. This prevented my project from compiling because ESPAsyncWebServer is coded using v5 in its AsyncJson module.

A downgrade of ArduinoJson to v5 should have solved the issue, but up popped another issue. Looking through the Github issues history I found exactly my problem, but relating to PlatformIO not Arduino IDE.

```
error: expected class-name before '{' token
 class AsyncJsonResponse: public AsyncAbstractResponse {
```

[https://github.com/me-no-dev/ESPAsyncWebServer/issues/475#issuecomment-464770544](https://github.com/me-no-dev/ESPAsyncWebServer/issues/475#issuecomment-464770544)

The solution was simply reorder my includes so AsyncJson is after the ESPAsyncWebServer. eg.

```
#include <ESPAsyncWebServer.h>
#include <AsyncJson.h>
#include <ArduinoJson.h>
```

The next quirk I encountered was the handler for receiving and processing json in the request body. The example given in the docs:

```
AsyncCallbackJsonWebHandler* handler = new AsyncCallbackJsonWebHandler("/api", [](AsyncWebServerRequest *request, JsonVariant &json) {
  JsonObject& jsonObj = json.as<JsonObject>();
});
server.addHandler(handler);
```

Never triggered even when my body had json in it. In the Github issues I found that this is down to the `AsyncJson.h` code not allowing for a Content-Type header that also included the code page data. There are two choices, modify the `AsyncJson.h` or set your client to match the exact Content-Type requirement of `application/json;` and not `application/json; charset=UTF-8`.

In my case I was able to modify the clients JavaScript axios call to specify the precise header without the code page. If you look at the `AsyncJson.h` file you'll find

```


if (!request->contentType().equalsIgnoreCase(JSON_MIMETYPE))
```

So there's no allowance for anything but the specific mime type and no code page. (See [jnicolson's comment](https://github.com/me-no-dev/ESPAsyncWebServer/issues/402#issuecomment-458723580))

Hopefully there'll be an upgrade to ESPAsyncWebServer that moves it to ArduinoJson v6, but right now using v5 is the answer.

### References

[Scorpion Lite](https://warlord0blog.wordpress.com/2019/03/27/scorpion-lite-esp8266/)
