---
pubDatetime: 2022-08-06T14:58:48Z
title: "Components, props and emit events"
tags:
  - "JavaScript"
  - "Laravel"
  - "vue.js"
description: "One of the things that trips me up is writing Vue components and passing in parameters and returning results. It's a one way process in the main. You can p"
---
One of the things that trips me up is writing Vue components and passing in parameters and returning results. It's a one way process in the main. You can pass data into a component, but it doesn't return anything unless you emit and event that returns something.

There are a few online tutorials that explain the use of `props`, and `emit`. This one I found useful:

[https://learnvue.co/tutorials/vue-emit-guide](https://learnvue.co/tutorials/vue-emit-guide)

Passing data to a component is done using `props`. You specify the property to pass and the data it contains in the component tag, something like:

```
<MyComponent :myProp="this.myData" />
```

This creates the component and passed `this.myData` into the components `props` as `myProp`.

```
<script>
export default {
  props: {
    myProp: {
      type: Object,
      default: {},
  }
  ...
}
</script>
```

Now we have data in we can access `myProp` in any of the components function calls, etc.

Getting data back is done by way of an event. The component must emit an event and pass data to be consumed by the parent component that responds to the event.

Events are created on the component tag using an `@` prefix, eg.

```
<MyComponent :myProp="this.myData" @myEvent="myFunction"
```

I must create `myFunction` in the parent component's methods, and I can then call it from the child component. But, what I fail to realise each time, is that you aren't calling a procedure as an emitted event. You are passing the function as an object parameter, or reference. Hence, there being no `()` in the `@myEvent` assignment. This is important to understand because it may look like things are working, but you will find you are not receiving the returning parameters.

In the child, call the event and pass parameters using:

```
this.$emit("myEvent", this.myReturn);
```

This will call the parent function `myFunction` and pass the child's `this.myReturn` as the returning data. It can be consumed like this:

```
methods: {
  myFunction(args) {
    console.log("args: ", args);
  }
  ...
}
```

> The main thing to take from this is **DO NOT** pass function calls to child components, pass a reference to the function, by not including the `()`.
