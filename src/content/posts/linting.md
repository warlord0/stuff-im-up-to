---
pubDatetime: 2018-08-06T19:45:19Z
modDatetime: 2018-08-08T07:20:31Z
title: "Linting"
tags:
  - "atom"
  - "JavaScript"
  - "node.js"
description: "No, this isn't about taking the fluff from your belly button - but you're close. https://eslint.org/ Linting your written code is a method of ensuring that"
---
No, this isn't about taking the fluff from your belly button - but you're close. [https://eslint.org/](https://eslint.org/) Linting your written code is a method of ensuring that it meets consistent syntax and style guidelines. Eg. ensuring you indent function blocks by 4 spaces and not tabs, placing curly braces {} on new lines, having spaces following function names and parameters etc.

> JavaScript, being a dynamic and loosely-typed language, is especially prone to developer error. Without the benefit of a compilation process, JavaScript code is typically executed in order to find syntax or other errors. Linting tools like ESLint allow developers to discover problems with their JavaScript code without executing it.

ESLint is a great way of ensuring my (ECMA)JavaScript coding style is consistent and correct. Using it within atom.io is a great way to keep my work tidy. Just add the ESLint package and we're set to track and tidy my `.js` files. But I want the same rules for my `.vue` files. I found this really handy: [https://alligator.io/vuejs/vue-eslint-plugin/](https://alligator.io/vuejs/vue-eslint-plugin/) Add the atom package `linter-eslint` then go to its settings button. Find the option "List of scopes to run ESLint on..." and add onto it:

    text.html.vue

So in my case it becomes:

    source.js, source.jsx, source.js.jsx, source.babel, source.js-semantic, text.html.vue
