---
pubDatetime: 2018-02-12T21:44:08Z
modDatetime: 2018-02-12T21:48:10Z
title: "bootstrap-tagsinput"
tags:
  - "Bootstrap"
  - "JavaScript"
  - "Laravel"
  - "Web"
description: "I've got a work project that fills in a database field with multiple comma separated values and thought using the bootstrap-tagsinput script would fit very"
---
I've got a work project that fills in a database field with multiple comma separated values and thought using the `bootstrap-tagsinput` script would fit very well. Only I managed to misinterpret the instructions and made a bit of a hole to dig myself out of. The big mistake I made was to add a `data-role="tagsinput"` attribute to my HTML. This was a bad mistake because I then tried to configure it using JavaScript - setting the tagClass and typeahead options. It worked, but nothing like I was expecting. I couldn't reference it by it's id selector using `$('#selector')` in the script and ended up using `$('.boostrap-tagsinput > input')` Which can't be right. Because I added the `data-role` attribute it meant that the input was already initialised as a tagsinput. So in my script where I tried to use `$('#selector').tagstinput({ `*`config`*` })` and ended up with using `$('.boostrap-tagsinput > input').tagsinput({ `*`config`*` })` I was actually initialising a new tagsinput control within the `data-role` version! My generated HTML had a `div` of `class="bootstrap-tagsinput"` inside another of the same class - very confusing. So the proper way, for my usage, was to NOT use `data-role` to set the field to a tagsinput, but to initialise it within JavaScript. Then I can use the `$('#selector')` and properly return the selected values and manipulate the control.

``` javascript

var myTags = $('#myTags').tagsinput({
  tagsClass: 'label label-success',
  itemValue: 'value'.
  itemText: 'text',
  typeahead: {
    minLength: 3,
    source: function(query) {
      return $.get('/api/myquery', {query: query});
    },
    afterSelect: function(val) {
      this.$element.val(''); // Clear the input box glitch
    }
  });

$('#myTags').on('itemAdded itemRemoved', function(el) {
  console.log(el);
  console.log($('#myTags').tagsinput('items'));
});
```

### References

[https://github.com/bootstrap-tagsinput/bootstrap-tagsinput](https://github.com/bootstrap-tagsinput/bootstrap-tagsinput)
