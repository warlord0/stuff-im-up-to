---
pubDatetime: 2017-11-15T14:05:44Z
modDatetime: 2017-11-15T14:18:47Z
title: "Monitor Security Flow"
tags:
  - "juniper"
  - "Networking"
description: "We stream the Juniper SRX logs out to our syslog server and that seems to work quite well. It is reliant upon us having the relevant log setting in the rul"
---
We stream the Juniper SRX logs out to our syslog server and that seems to work quite well. It is reliant upon us having the relevant log setting in the rules. So for rules where we allow we can log the data at session-close

    ...
        then {
            permit;
            log {
                session-close;
            }
        }

But in our Deny All rules we log the session-init - because a denied session never gets closed (it's never opened). So the session-init just logs the attempt.

    ...
        then {
            deny;
            log {
                session-init;
            }
        }

But what if we're missing some rule logging, or are a bit unsure if packets coming in are actually coming in or not? That where `monitor security flow` comes in handy. At the cli on the SRX you need to setup and activate the security flow, the filters to apply and the file to log to. In this example we're going to capture packets from a specific ip address on a particular interface. Create a named filter called 'myfilter' and then create a file to log into.

    > monitor security flow filter interface reth0 source-prefix 192.168.56.10 myfilter
    > monitor security flow file size 10240 securityflow.log

Then you can start and stop the monitor as you need. Then look at the content of the file.

    > monitor security flow start
    > monitor security flow stop
    > show log securityflow.log

View the current status of your monitor

    > show monitor security flow

    Monitor security flow session status: Active
    Monitor security flow trace file: /var/log/securityflow.log
    Monitor security flow filters: 1
      Name: myfilter
        Status: Active
        Source: 192.168.56.10/32 (port 0~65535)
        Destination: 0.0.0.0/0 (port 0~65535)
        Logical system: root-logical-system
        Interface: reth0.0

Copy the log file to another system if you want to analyse it further

    > file copy /var/log/securityflow.log scp://user@server.domain.local:~/

After stopping your monitor, you can then tidy up removing your file and filter using

    > file delete /var/log/securityflow.log
    > clear monitor security flow filter myfilter
