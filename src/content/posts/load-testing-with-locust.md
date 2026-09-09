---
pubDatetime: 2021-02-03T17:42:38Z
title: "Load Testing with Locust"
tags:
  - "Linux"
  - "python"
description: "This has been a very tough few days. I was asked to build some load testing scripts for use with Locust. I was told \"How hard can it be? Just a few scripts"
---
This has been a very tough few days. I was asked to build some load testing scripts for use with Locust. I was told "How hard can it be? Just a few scripts to poke a web site."

The actual involvement requires investing in Python and digging deep into the chrome developer window to capture form data and parameters to use in the testing.

Back in the day of unit testing with Laravel I used Dusk which loaded a browser and automated it to carry out the tests. I was expecting that kind of thing here. No, take a step further back and look at PHPUnit testing and that's more like how things are scripted for Locust.

With a browser you connect to a website, navigate around and the browser handles all of the session data and form submission type things. With Locust we are back to making our own http/json client calls to urls passing data and parsing responses. Unless you are testing a simple page hit you'll need to process the returned HTTP Response to really act like a visitor and not a search robot.

Using Locust to visit a single page and trow away the response was fairly easy. You setup a task and git it a URL to query. Then you can spin up your Locust master and worker and hammer away simulating 100's of users per second.

Testing a more realistic scenario where a users visits a page, chooses a product, adds it to their basket, goes to the checkout and then pays, takes a lot more effort. It requires the collection of data along the way and returning it to the next call.

The best example of this is a CSRF, Cross Site Request Forgery token. In order to submit the form on the page you need to get the `csrf_token` from the response and submit it with the rest of your data. Failing to send the CSRF results in your POST command failing and your locust test testing how fast your server can fail.

I used some Python libraries to help with this I needed something that could parse a HTML Response and parse form data that I need to submit. For these I used `BeautifulSoup` and `urllib`.

The example below visit the `/form` page, scans the HTML for `<form>` elements to find the form we need, extracts the CSRF token, builds some data and submits the data along with the CSRF to the url `/buyme`.

```
from locust import HttpUser, task, between
from bs4 import BeautifulSoup
from urllib import parse

class MyUser(HttpUser):
  wait_time(2, 7)

  @task
  def submit_form_with_csrf(self):
    response = self.client.http("/form")
    # Get the HTTP Response and extract the <forms>
    forms = self.get_all_forms(response.read())
    # Some pages have several forms. Find the one we need
    for form in forms:
      if form.attrs.get("action").lower() == "/buyme":
        # Get all the <inputs>
        inputs = self.get_all_inputs(form)
        # Extract the CSRF
        csrf_token = self.find_by_name(
            inputs, "csrf_token")[0]["value"]
        # Create the data to submit to the form
        data = {
          "csrf_token": csrf_token,
          "product_id": 123456,
          "qty": 12
        }
        # Submit the data
        response = self.client.http(
             "/buyme", data=parse.urlencode(data).encode())     

    def get_all_forms(self, body):
        """Returns all form tags found in the response body"""
        soup = BeautifulSoup(body, "html.parser")
        return soup.find_all("form")

    def find_by_name(self, list, search):
        """Returns array of matching list items"""
        res = []
        for item in list:
            if item["name"] == search:
                res.append(item)
        return res
```

This is a relatively simple process a single response situation. You can expand it out adding lots of other parts in the task to chain the test through the entire product to purchase scenario using the same technique to extract and parse information at each stage.
