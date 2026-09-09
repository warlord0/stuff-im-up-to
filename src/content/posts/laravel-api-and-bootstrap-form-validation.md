---
pubDatetime: 2018-08-13T20:49:25Z
modDatetime: 2018-08-13T21:05:44Z
title: "Laravel API and Bootstrap Form Validation"
tags:
  - "ajax"
  - "axios"
  - "JavaScript"
  - "Laravel"
  - "Web"
description: "This caused me some grief today. I spent the day adding validation rules into my Laravel resource controller and rather foolishly set HTML5 validation para"
---
This caused me some grief today. I spent the day adding validation rules into my Laravel resource controller and rather foolishly set HTML5 validation parameters on my Vue.js / Bootstrap 4 form component.

## Why foolishly?

Well if you follow the Bootstrap 4 JavaScript function to call `form.checkValidity()` you're actually calling the HTML5 built in function. Not a Bootstrap function as I originally thought. When Laravel validation failed at the resource controller and it pushes back `422 (Unprocessable Entity)` and a json error object:

    {"message":"The given data was invalid.","errors":{"name":["The name field is required."]}}

I thought Bootstrap was seeing the Laravel validation errors and flagging up fields as not valid. So I could not understand why one of my fields didn't show as invalid when according to Laravel it was! What I was actually doing was HTML5 validation and ignoring my Laravel validation response all together. With the API it's best NOT to try to use both HTML5 and Laravel validation. You'll get a confusing UX that uses a mix of browser error messages/popups and Bootstrap CSS error handling. Make sure you add `novalidate` to your form tag - this ensures HTML5 browser validation is prevented at the form level. To resolve the Laravel validation part I just use the Laravel json error object and **DON'T USE** `checkValidity()`, my axios `.catch(error)` processes the Laravel errors by calling `showErrors(error.response.data)`

     this.axios.post('/api/v1/mycall/',
       this.data
     ).then(() => {
       // That worked out well, do something.
     }).catch(error => {
       this.showErrors(error.response.data)
     })

     showErrors: function (error) {
      Object.keys(error.errors).forEach((field) => {
        let input = document.getElementById(field)
        input.classList.add('is-invalid') // Bootstrap invalid form input
      })
     }

This iterates through the json errors and adds the class `is-invalid` to the fields that Laravel tells me are invalid. This triggers Bootstraps CSS to show the field with a red border and unhides the form-control subsequent/child div that has a class of `invalid-feedback`

### References

[https://getbootstrap.com/docs/4.1/components/forms/#validation](https://getbootstrap.com/docs/4.1/components/forms/#validation) When using Vue.js and Laravels json response the actual usage is closer to the server-side examples: [https://getbootstrap.com/docs/4.1/components/forms/#server-side](https://getbootstrap.com/docs/4.1/components/forms/#server-side)
