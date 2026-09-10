---
pubDatetime: 2019-08-07T11:28:02Z
title: "Laravel, Guzzle and Nginx"
tags:
  - "Laravel"
  - "php"
  - "Web"
heroImage: "/blog-media/2016/09/laravel.jpg"
description: "After deploying a working test into our pre-production environment the Guzzle API calls we were making to fetch bank holiday data from the .gov.uk site sta"
---
After deploying a working test into our pre-production environment the Guzzle API calls we were making to fetch bank holiday data from the `.gov.uk` site starting failing.

```
Error creating resource: [message] fopen(https://www.gov.uk/bank-holidays.json): failed to open stream: Connection timed out
 [file] /var/www/itsmpreprod/vendor/guzzlehttp/guzzle/src/Handler/StreamHandler.php
 [line] 323 {"exception":"[object] (GuzzleHttp\Exception\RequestException(code: 0): Error creating resource: [message] fopen(https://www.gov.uk/bank-holidays.json): failed to open stream: Connection timed out
```

I spent quite some time trying to figure out what the issue was. Nginx would return a 504 Gateway timed out message.

It transpires that Guzzle is pretty smart in what it does. It's capable of using various types of calls to retrieve the data. In a development environment, under the artisan server, it was happy using `tcp` sockets, but once on the server under Nginx it tries to use curl.

I got my clue from here:

[https://github.com/guzzle/guzzle/issues/1841#issuecomment-341395019](https://github.com/guzzle/guzzle/issues/1841#issuecomment-341395019)

It looks like the issue was just because we hadn't got the php module `php7.0-curl` installed!

```
$ sudo apt install php7.0-curl
```

Once installed we had to change the proxy scheme from `tcp` to `http` and the calls then worked as expected.

```
    public function getApiData()
    {
        $client = new Client();
        $res = $client->request(
            'GET', 'https://www.gov.uk/bank-holidays.json',
            [
                'proxy' => 'http://proxy:port'
            ]
        );
        return $res->getBody()->getContents();
    }
```
