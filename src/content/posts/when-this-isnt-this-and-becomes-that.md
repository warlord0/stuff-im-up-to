---
pubDatetime: 2018-10-02T11:36:44Z
title: "When this isn't this and becomes that"
tags:
  - "JavaScript"
  - "vue.js"
heroImage: "/blog-media/2018/07/vue1.png"
description: "I recently tried to assist a colleague with an issue in JavaScript involving an undefined variable within a Vue.js app. Now I have encountered this issue s"
---
I recently tried to assist a colleague with an issue in JavaScript involving an undefined variable within a Vue.js app. Now I have encountered this issue several times and never really gotten to the crux of the matter other than I know it's because the context of `this` changes, depending on where you are in your code. It was during this tongue twisting exercise that he found a useful document that gives an outline more elegantly than I could phrase. [https://gist.github.com/JacobBennett/7b32b4914311c0ac0f28a1fdc411b9a7](https://gist.github.com/JacobBennett/7b32b4914311c0ac0f28a1fdc411b9a7)

> Since arrow functions provide a lexical `this` value, the `this` inside our `function()` refers to the `window` instead of our Vue object which breaks our current implementation! When attempting to get `this.item`, we will actually be looking at `window.item` which is currently `undefined`.
