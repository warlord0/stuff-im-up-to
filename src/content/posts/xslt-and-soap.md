---
pubDatetime: 2018-09-14T07:30:54Z
modDatetime: 2018-09-14T08:41:00Z
title: "XSLT and SOAP"
tags:
  - "Linux"
  - "Windows"
  - "xml"
description: "All of our SOAP interactions with the Lagan CRM send and return SOAP and by association, XML. The normal practice of handling the sent or returned XML is b"
---
All of our SOAP interactions with the Lagan CRM send and return SOAP and by association, XML. The normal practice of handling the sent or returned XML is by using XSLT to transform the data to and from the required format. The forms product will submit XML through an XSL translation taking data from the POST'ed form data and turning it into the XML format/type required. The returned XML data must also be processed via an XSLT to present the data to the form.

> How do we go about testing translations and stylesheets without constantly publishing forms and requesting data from the CRM server?

For this I used postman to submit and retrieve sample SOAP envelopes with the required XML `soapenv:Body`. Then I can take the returned sample data and save it to an XML file. Now I have a local sample of the XML I can use an XSLT tool to process it via a locally created stylesheet. No more repetitive form submissions or having to work with only the form product to develop the XSLT. ![xlst_working](/blog-media/2018/09/xlst_working.jpg)

## XSLT Tools

There are a very few XSLT tools that seem to do the job for free. Certainly when it comes to a GUI environment all the tools are paid for products. At the command line there are some free options, but each have challenges. But I figured that just because it's command line, doesn't mean I can't use it in a GUI. Atom has a very useful plugin that can be used to interface with the command line XSLT programs - [atom-xsltransform](https://atom.io/packages/atom-xsltransform). The settings for the plugin just point to the XSLT processor of your choice. Once installed you press `ctrl-shift-p` whilst in your XML source file, it prompts you for the path of the XSLT transformation file to use and then returns the output into an edit tab in Atom.

### MSXSL

For Windows I came across a very simple command line product from [Microsoft MSXSL](https://www.microsoft.com/en-gb/download/details.aspx?id=21714). It doesn't look like there's a recent version as this dates back to 2004. But as XML has been around for 20 years or so this may not be a problem. I did however find it seemed to produce broken output that looked to be to do with unicode. So maybe it's not capable of handling the UTF-8 files I'm using.

### xsltproc

This is from the world of Linux, but there is a port to Windows that works. For Linux just install it from the repository:

    $ sudo apt-get install xsltproc

For Windows, it's harder work. Not significantly, but frustrating. You need to download a series of files, extract them all into the same place, to let their individual `bin` folders merge their contents. Then you can run the included `xsltproc.exe` and it should find all of the dll's. [ftp://ftp.zlatkovic.com/libxml/](ftp://ftp.zlatkovic.com/libxml/) I chose the 64bit 7z files and extracted these files:

- iconv-1.14-win32-x86_64.7z
- libtool-2.4.6-win32-x86_64.7z
- libxml2-2.9.3-win32-x86_64.7z
- libxslt-1.1.28-win32-x86_64.7z
- mingwrt-5.2.0-win32-x86_64.7z
- openssl-1.0.2e-win32-x86_64.7z
- xmlsec1-1.2.20-win32-x86_64.7z
- zlib-1.2.8-win32-x86_64.7z

### Saxon

This is a Java product and comes in a number of versions from home edition to professional that requires payment. It's hosted here on Sourceforge: [http://saxon.sourceforge.net/](http://saxon.sourceforge.net/) I downloaded the HE (home edition) and just placed the jar files somewhere I could use them. From the Linux command line I used it like this:

    $ java -jar saxon9he.jar -s:/home/user/lagan/xslt/FWTCaseFullDetails.xml -xsl:/home/user/lagan/xslt/FWTCaseFullDetails.xslt

## Atom plugin settings

It's a simple case of putting in the path of the executable you want to run. Pay attention to the order of the parameters for the tools. MSXML and xsltproc have the XML and XSL options in a different order. For the Linux xsltproc settings I used:

    /usr/bin/xsltproc %XML %XSL

For Saxon I had to be specific about where the jar file was as I haven't installed it into the java class path.

    java -jar /home/home/saxon/saxon9he.jar -s:%XML -xsl:%XSL

## Stylesheets

The XSLT stylesheet acts as the instruction set to take the XML input and apply the XSLT logic to transform the XML content into another format such as text or HTML. W3Schools has some useful guidance here: [https://www.w3schools.com/xml/xsl_intro.asp](https://www.w3schools.com/xml/xsl_intro.asp) Another useful intro: [https://www.tutorialspoint.com/xslt/](https://www.tutorialspoint.com/xslt/)
