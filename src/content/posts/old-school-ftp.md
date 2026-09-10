---
pubDatetime: 2017-08-07T07:37:09Z
modDatetime: 2017-08-07T07:44:10Z
title: "Old School FTP"
tags:
  - "ftp"
  - "Networking"
heroImage: "/blog-media/2016/09/logo_debian_orange_by_monkeymagico.png"
description: "Calculating the FTP data port from the passive response."
---
Having recently replaced the firewall we found one of the external sites used for FTP file transfers was failing periodically. Turns out this was a simple problem. We just weren't allowing enough of a range for the FTP data ports needed. We'd allocated a range of 1,000 ports, but looks like they use more. So how did we find this out? I could have trawled the firewall logs, but was just easier to see what the FTP log file was telling me. The log file generated the error "425 Unable to open the data connection". After looking at the previous passive mode response I decoded the port that it required.

    ftp> 227 Entering Passive Mode (192,168,0,250,109,116)

It's a simple calculation. The first four numbers are the remote servers IP address and the last two specify the TCP data port required. In order to determine the port take the 5th number and multiply by 256 then add the 6th number. eg.

    109 x 256 + 116 = 28020

So now I've extended the allowed port range to include 28000-28999 to make the connection.

> Ideally it would be best to get the remote server administrator to tell you what range they require. But if you have to resort to guessing at least you know how to calculate their requirement.

  References: [https://www.ietf.org/rfc/rfc959.txt](https://www.ietf.org/rfc/rfc959.txt)
