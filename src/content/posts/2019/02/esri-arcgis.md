---
pubDatetime: 2019-02-21T11:16:31Z
title: "ESRI ArcGIS"
tags:
  - "JavaScript"
  - "vue.js"
  - "Web"
heroImage: "/blog-media/2019/02/arcgis.jpg"
description: "Over the past few weeks I've entered into the world of spacial systems and mapping. We have a couple of members of staff who look after our GIS (Geographic"
---
Over the past few weeks I've entered into the world of spacial systems and mapping. We have a couple of members of staff who look after our GIS (Geographic Information Systems) that plot all kinds of spacial data onto maps for properties, water courses, streets, etc. The data they produce is used widely through many of our services, but now we're starting to provide more interactive online mapping for the public.

[ESRI ArcGIS Online](https://www.esri.com/en-us/arcgis/products/arcgis-online/overview)

## Why not use Google maps?

Initially we planned on using Google maps as the main forms based product we were planning on using integrates with Google maps and it works pretty well. The problem we encountered was one of copyright, and means that Google maps can't be used.

Googles terms and conditions pretty much state that any data or material that you upload to their systems gives them free reign not just on its use and reuse, but also hands them the intellectual rights to it.

Because our spacial and mapping systems use Ordinance Survey as a means of constructing our data the Ordinance Survey terms and conditions do not allow this type of usage. We have a clash of licensing terms and conditions.

As the forms product also supports ESRI ArcGIS maps it was time to investigate further.

## ESRI ArcGIS

When a visitor to our site wants to navigate a map to report a problem at a specific location the visual choice between Google and ESRI is of no real concern. It's a map, I can click and drag and zoom, see streets and details in the same way. What is different is how we as developers present that map and it's data.

My initial findings are ESRI is far more difficult to achieve what we are trying to do than Google seemed. But the more I got involved with the API I found it to be far more flexible and would carry out some surprising tasks with our spacial data without me even having to upload any of the data onto an ESRI service! So if the data doesn't get put onto a hosting system there can be no breach of our licensed usage.

That said I can choose to upload data to features to the ESRI online servers and have them host my spacial data to display on their maps. I can even choose the share it publicly whilst maintaining ownership of the data and even including a reference to our Ordinance Survey licence - in line with OS usage requirements.

There is a steep learning curve for spacial systems and ESRI, but I persevered with it and find I can drive the map, show layers and place points and polygons. I'm well on the way to being able to provide a powerful solution to make problem reporting from our live CRM data interface with our spacial systems like OS AddressBase a breeze.

## So how are we using it?

The main product that the public are going to visit is a CRM based forms product. It collects and displays point based map data to allow a member of the public to report dog fouling, fly tipping, graffiti, abandoned vehicles, etc.

It's a fairly traditional product using a simple ESRI map and using JQuery to power the forms. But as my primary work takes me away from JQuery I chose to learn the ESRI API from within Laravel and Vue.js rather than go back to JQuery.

That said the knowledge gained in Vue.js should still be reusable in JQuery. I'm hoping it will allow me to transfer some of my ideas for using the map within the forms product in ways that will take it to the next level.

```
API v3.27 Documentation https://developers.arcgis.com/javascript/3/jsapi/
```

### Using the esri-loader

The ESRI API uses the [dojo toolkit](https://dojotoolkit.org/) for loading modules. All of the ESRI API examples make extensive use of dojo features. This is where there's a big change coming from the Vue angle. There's little point bundling in another JavaScript framework when we already have Vue.

ESRI have thoughtfully come up with a loader that means you can use the API from non-Dojo applications.

<https://github.com/Esri/esri-loader>

### Vue Mixins for ESRI

Initially I was loading modules with the `loadModules` class and manually referencing them in my code. Then we decided to ramp it up a notch and create a more dynamic approach and put all the required ESRI base functions into a [mixin](https://vuejs.org/v2/guide/mixins.html).

This means the use of ESRI maps within our Vue project is much more reusable and really tidies up the code in the components where a map is used.

Now we just `import` our ESRI mixin and we have a map. We then only have to add any component specific ESRI functions like adding a layer or points from [geoJson](http://geojson.org/) data to the component. All done using the calls to ESRI functions from the mixin.

#### The Code

https://gist.github.com/warlord0/db84c33f360da2ac631ceb258b67ad68

esriFunctions.js Vue Mixin

Ensure that in your Vue template you include a `div` with a `ref="map"` attribute. We can then in our Vue component script section import the mixin and make use of it:

```
import esriFunctions from '../mixins/esriFunctions'

export default {
  data () {
    return {
      esriModules: [
        // Add any additional esri modules in here eg.
        'esri/geometry/Polygon'
      ]
    }
  },
  ...
  methods: {
    onMapClicked (e) {
      // Do something with the map click event
    }
  }
}
```
