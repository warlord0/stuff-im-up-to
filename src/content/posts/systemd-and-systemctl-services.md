---
pubDatetime: 2017-11-01T14:02:25Z
modDatetime: 2018-07-14T19:03:33Z
title: "Systemd and systemctl services"
tags:
  - "debian"
  - "Linux"
description: "I know it's not all that new, but not something I've spent much time working with. Previously using init.d to enable/disable systems services. Today I remo"
---
I know it's not all that new, but not something I've spent much time working with. Previously using init.d to enable/disable systems services. Today I remove a program from my system and purged the config files. But it left behind a service in a failed condition. Of course it failed. I just removed all the files and config. Using `systemctl` I could see my magicbox service still there and failed.

    $ systemctl status magicbox.service                                   
    ● magicbox.service - Magic Box process
       Loaded: loaded (/usr/lib/systemd/system/magicbox.service; enabled; ven
       Active: failed (Result: exit-code) since Wed 2017-11-01 13:36:57 GMT; 1min 9s
      Process: 839 ExecStart=/opt/magicbox/embedded/bin/start (code=exited, s
     Main PID: 839 (code=exited, status=203/EXEC)

Thankfully the clue is in the output. It tells me where the `.service` file is on the Loaded: line. So to tidy up I followed part of the guidance I found here: [https://superuser.com/questions/513159/how-to-remove-systemd-services](https://superuser.com/questions/513159/how-to-remove-systemd-services)

    $ sudo systemctl disable [servicename]
    $ sudo rm /etc/systemd/system/[servicename]
    $ sudo systemctl daemon-reload
    $ sudo systemctl reset-failed

But bear in mind that the service I want isn't located there. It's under `/usr/lib/systemd/system` so I needed to remove that file instead.

## References

[https://manpages.debian.org/jessie/systemd/systemd.unit.5.en.html](https://manpages.debian.org/jessie/systemd/systemd.unit.5.en.html) - See table 1 [https://medium.com/@johannes_gehrs/getting-started-with-systemd-on-debian-jessie-e024758ca63d](https://medium.com/@johannes_gehrs/getting-started-with-systemd-on-debian-jessie-e024758ca63d)
