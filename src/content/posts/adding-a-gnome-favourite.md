---
pubDatetime: 2019-07-15T10:30:06Z
modDatetime: 2020-01-08T13:25:01Z
title: "Adding a Gnome Favourite"
tags:
  - "Linux"
description: "I was trying to add the Postman app to my Gnome favourite bar, but right clicking it doesn't give me the option to add it as a favourite. Apparently if you"
---
I was trying to add the Postman app to my Gnome favourite bar, but right clicking it doesn't give me the option to add it as a favourite.

Apparently if your application is not seen as an Activity then it can't be added. Usually I'd just create a `.desktop` file and use that with a launcher. But Gnome doesn't really work like that.

I found the answer was to create my `.desktop` file and then copy/move it to `/usr/share/applications` or if it is a user specific application `~/.local/share/applications`.

```
$ gnome-desktop-item-edit ~/Desktop/ --create-new
$ sudo mv ~/Desktop/Postman.desktop /usr/share/applications 
```

Then I can use the "Activities" to search for the app and can now add it as a favourite.
