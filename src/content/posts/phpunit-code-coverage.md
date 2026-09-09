---
pubDatetime: 2019-03-05T10:07:48Z
modDatetime: 2019-03-05T14:02:14Z
title: "PHPUnit Code Coverage"
tags:
  - "Linux"
  - "php"
  - "Windows"
description: "The more development time we spend on the corporate Laravel app the more mature the code becomes and the more our development practices evolve. One of the"
---
The more development time we spend on the corporate Laravel app the more mature the code becomes and the more our development practices evolve.

One of the introductions was to ensure we carried out unit testing on our modules and classes to ensure we don't break any existing functionality by introducing new features.

We started using PHPUnit to carry out the testing for our Laravel/PHP API's. Now when we run our tests can we really be sure we haven't broken anything? All we're really doing is proving that we get consistent results to our tests. What we aren't sure of is if the tests we have built are sufficient to cover all eventualities handled by our code eg. we know the test works when we pass in valid parameters, but did we write a test that passed in bad parameters, or test that we get a failure when we should?

This is where PHPUnit's code coverage plugin comes into it.

By running PHPUnit with the code coverage option we get a detailed report on what parts of our code actually get used by our unit tests. This enables us to see parts of our code that could benefit by having tests written to try out those areas too.

In order to use the code coverage feature we need to install the PHP module for `xdebug`. With our current environment using PHP v7.0 and my development system running Linux I needed to do a `pecl install` to get the module installed and add it to my PHP cli config.

```
$ sudo pecl install xdebug
$ sudo vi /etc/php/7.0/cli/conf.d/20-xdebug.ini
```

Then add in the Zend extension

```
zend_extension=/usr/lib/php/20151012/xdebug.so
```

With the module loaded we then extend our PHPUnit command line to get it to generate the code coverage report.

```
$ ./vendor/phpunit/phpunit/phpunit -v --coverage-html ./tests/codeCoverage
```

This causes PHPUnit to output a series of static HTML pages into `./test/codeCoverage`. You can then open the `index.html` to view the output.

Currently our output isn't great. We have much of our code uncovered by PHPUnit tests. But this is our chance to begin changing that.

Typical output clearly shows what parts of the code are not touched by our tests. Whilst we may have coding to handle certain scenarios, we haven't written any tests that ensure that all parts of our code are tested eg.

![](/blog-media/2019/03/image.png)

What we're seeing is that we have a test that runs through when we don't pass in an array, but we don't have a test that runs though when we do pass an array. What we need to do is write a test that would pass through that part of our code, by passing it all parameters to ensure it does run through all parts of the `if` statement.

The eventual outcome would be to have tests that pass all types of parameters, even bad ones. Then we'll start seeing all of our code coverage going green and moving towards 100% covered by our unit tests.

### References

<https://jtreminio.com/blog/unit-testing-tutorial-part-iii-testing-protected-private-methods-coverage-reports-and-crap/>
