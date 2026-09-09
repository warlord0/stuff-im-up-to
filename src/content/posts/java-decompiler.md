---
pubDatetime: 2018-11-06T13:21:22Z
title: "Java Decompiler"
tags:
  - "java"
  - "Web"
description: "Today I've been working on a problem where properties being loaded into our CRM system from a GIS DTF file are doing some strange updates. It appears that"
---
Today I've been working on a problem where properties being loaded into our CRM system from a GIS [DTF](https://www.geoplace.co.uk/documents/10181/433656/SUPERSEDED+-+DTF7+3v3-1_Third_Edition_Specification_Document_070212-FINAL.pdf/d38ad3ac-9f9d-4121-bfd6-85204bfc922f?version=1.1) file are doing some strange updates. It appears that the vendor in their wisdom has decided to populate user defined fields that we already use! The Loader is written in Java, I have a `.jar` file and can extract the `.class` files, but they're all compiled. A bit of searching reveals an online decompiler I can use: [http://www.javadecompilers.com/jad](http://www.javadecompilers.com/jad) I started using it to decompile one `.class` file at a time and quickly became bored. So tried the whole `.jar` file. It happily decompiled the file and returned a single zip file containing the decompiled `.class` files as `.java`files. Now I can scan the `.java` files to find out what other SQL calls they are making to fill other fields we might be using.
