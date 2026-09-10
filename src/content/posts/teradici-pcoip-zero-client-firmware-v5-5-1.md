---
pubDatetime: 2017-08-09T14:01:49Z
title: "Teradici PCoIP Zero Client Firmware v5.5.1"
tags:
  - "horizon"
  - "Networking"
heroImage: "/blog-media/2017/02/teradici-pcoip-logo.png"
description: "After downloading the PCoIP firmware update to deploy to our terminals I uploaded it to a test station using the \"Admin Web Interface\" (AWI) - the built in"
---
After downloading the PCoIP firmware update to deploy to our terminals I uploaded it to a test station using the "Admin Web Interface" (AWI) - the built in web GUI on the terminal, not from the central management console. It seemed to go OK, but when it reset the PCoIP processor, effectively a reboot, it came up with a dialog showing the message:

> Warning : Multilanguage font pack not found ! Defaulting to English only : Please update firmware to enable multilanguage support

I tried re-uploading the file and still received the same result. The terminal I chose was originally v5.3.0 and there was a version 5.4.1 available that I just skipped. So I uploaded the v5.4.1 firmware and reset. The message went away. Next I uploaded the v5.5.1 firmware onto the Management Console and added the terminal into a testing group that delivered the v5.5.1 firmware using a testing profile. I monitored the logs and saw the profile get applied and the firmware transferred. Following the reset it came up as v5.5.1 and no warning message. I can't be certain what the actual fix was. Maybe the upgrade to v5.4.1 before v5.5.1 was all that was needed. I guess I should try another v5.3.0 terminal to see if the warning reoccurs on a management console upgrade rather than AWI.
