---
pubDatetime: 2019-02-04T09:04:47Z
title: "PHPUnit - Version Mismatch"
tags:
  - "Laravel"
  - "php"
  - "Web"
description: "As our codebase matures we return to develop unit tests to ensure our QA process captures any code changes that may have altered the functionality of the p"
---
As our codebase matures we return to develop unit tests to ensure our QA process captures any code changes that may have altered the functionality of the product.

When calling PHPUnit on Windows or Linux we ran into some issues relating to the version of PHPUnit we had installed.

On Windows it was an ancient PHPUnit version 3 and on Linux It was running version 7. Neither of which were compatible with our Laravel 5.5 project which uses php version 7.0.

In order to use PHPUnit with our project we must use PHPUnit version 6 (see [Supported Versions](https://phpunit.de/supported-versions.html))

What I hadn't realised is that we had installed PHPUnit both locally into the OS and with our Laravel project so it exists in `composer.json` and gets installed under the projects `./vendor`. The version installed in the OS path is the version that isn't compatible with our project, but because it's in our path it's taking precedence over our project installed version.

To run the project version we just need to be specific in how we call it.

```
$ ./vendor/phpunit/phpunit/phpunit
```

```
PHPUnit 6.5.13 by Sebastian Bergmann and contributors.

....F                                                               5 / 5 (100%)

Time: 345 ms, Memory: 16.00MB

There was 1 failure:

1) Tests\Unit\Finance\CostCodeTest::testApiGetCostCodes
Expected status code 401 but received 200.
Failed asserting that false is true.

/home/user/itsm/vendor/laravel/framework/src/Illuminate/Foundation/Testing/TestResponse.php:78
/home/user/itsm/tests/Unit/Finance/CostCodeTest.php:37

FAILURES!
Tests: 5, Assertions: 14, Failures: 1.
```
