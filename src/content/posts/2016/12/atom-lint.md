---
pubDatetime: 2016-12-14T13:37:26Z
modDatetime: 2017-03-01T14:22:03Z
title: "Atom & Lint"
tags:
  - "CoffeeScript"
  - "JavaScript"
  - "Web"
heroImage: "/blog-media/2016/12/coffeescript11.png"
description: "I've been using Atom for a little while now and have to say I find it a lot quicker than Brackets. It has the occasional moment when loading a large script"
---
I've been using Atom for a little while now and have to say I find it a lot quicker than Brackets. It has the occasional moment when loading a large script file and it tries hard to parse it and colourise it that causes it to hang for an age, but mostly it performs really well for me. One of the excellent features I find useful is the integration with Git. I can easily see what line of a script I've changed, added or deleted. The next feature I added was lint. Lint allows Atom to validate the script you're writing meets guidance for it's structure. There are several lint plug-ins you can use, but the one I'm using mostly is coffee-lint. This lints my CoffeeScript and reports if I'm failing outside of the guide lines for the document structure. eg. a trailing space on a line, a line length longer than 80 characters or an indentation issue. It all helps to keep your code clean and consistent and in theory readable by anyone else. [http://www.coffeelint.org/](http://www.coffeelint.org/)

> By default, CoffeeLint will help ensure you are writing idiomatic CoffeeScript, but every rule is optional and configurable so it can be tuned to fit your preferred coding style.

To begin with I used coffeelint from the command line:

    $ coffeelint [file].coffee

This then reports the line numbers where you have some issues. My main issue is that I prefer my indents to be 4 spaces, not 2. So out of the box I get a lot of issues about indentation. To solve this I created a coffeelint.json file. This file contains all the rule settings for the lint program to apply. Create a config file in your project folder using:

    $ coffeelint --makeconfig > coffeelint.json

Then edit it with a text editor (like Atom) and set the `indentation:` value to 4.

      "indentation": {
        "value": 4,
        "level": "error"
      },

Now when you lint your project it will follow those rules. Linting in Atom is even easier. If you install the `coffee-lint` plug-in and then open a `.coffee` file it will automatically lint the file and show you any errors as you type. **Edit**: I struggled with this on Windows and found that I had to edit my `package.json` file and add in a `"coffeelintConfig"`: section with the rules I wanted in.
