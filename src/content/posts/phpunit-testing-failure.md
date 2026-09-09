---
pubDatetime: 2019-08-14T10:43:08Z
modDatetime: 2019-08-20T18:38:50Z
title: "PHPUnit Testing Failure"
tags:
  - "Laravel"
  - "php"
  - "Web"
description: "Today's challenge caused me to burn a lot of time before resolving the issue, which turned out to be an obvious mistake. When I run a unit test I need to a"
---
Today's challenge caused me to burn a lot of time before resolving the issue, which turned out to be an obvious mistake.

When I run a unit test I need to add a number of test rows to the database using the [Faker](https://github.com/fzaninotto/Faker) that is built into Laravel. So I added this into my `setUp()` function.

When the test is finished I need to tidy up and remove the rows I added which I put into my `tearDown()` function.

The first thing done inside a function override is call the parent function so we call `parent::setUp()` and `parent::tearDown()` respectively. Almost all my test are like this. But when I reached one of them it failed and I could not figure out why.

```
PHPUnit 6.5.14 by Sebastian Bergmann and contributors.

 E                                       1 / 1 (100%)

 Time: 321 ms, Memory: 30.00MB

 There was 1 error:

 1) Tests\Unit\Finance\CostCentreOwnersTest::testApiGetCostCodes
  ReflectionException: Class config does not exist
... 
  /…/app/Observers/CostCentreOwnersObserver.php:78
  /…/app/Observers/CostCentreOwnersObserver.php:69
```

I refactored a lot of code trying to find this issue. The light bulb moment was seeing only one of my deletions happening in the `tearDown()`. I then spotted the `CostCentreOwnersObserver` in the errors.

Of course! I'm using an Eloquent event trigger within the Observer and that is now failing. It's the only difference to the other tests - they don't have events.

I realised my simple mistake. I was calling the `parent::tearDown()` before I was deleting my test rows. So the actual failure was relating to me destroying the environment before I've finished with it.

Because the other test models don't have Eloquent events the `parent::tearDown()` being in the wrong order didn't affect them.

### TL;DR

> The Moral of this story is make sure your call to `parent::tearDown()` is the last thing in your tests `tearDown()` function.
