---
pubDatetime: 2018-10-01T14:15:54Z
title: "Adding Crucible to Jira"
tags:
  - "Web"
heroImage: "/blog-media/2018/09/58480948cef1014c0b5e48fd.png"
description: "Continuing the Jira and Confluence journey into Crucible I faced a challenge of adding it beneath the same reverse proxy setup. My aim was to end up with a"
---
Continuing the Jira and Confluence journey into Crucible I faced a challenge of adding it beneath the same reverse proxy setup. My aim was to end up with a single host with multiple URL's for each feature eg. https://jira.domain.local - for Jira Software https://jira.domain.local/confluence - for Confluence https://jira.domain.local/crucible - for Crucible The documentation on how to achieve this was a little fragmented and whilst it made sense I failed to get things working first time round. Installing crucible is very easy following the [install guides](https://confluence.atlassian.com/crucible/getting-started-298977369.html). You pretty much extract the product copy and edit a config file and start the service. The fun began when I tried to edit the config to match my reverse proxy requirements without first going into the initial setup and using the admin interface. The problem is that if you edit the `config.xml` file then restart the service you can't get to the admin interface as it's still sitting on the default URL using http://jira.domain.local:**8060**/admin. What happens is the `config.xml` tells Jetty how to serve a different context, but this doesn't match the applications internal configuration, because so far you haven't configured that part. The result is you end up being presented with broken pages that you can't get in to do any configuration. I ended up resetting the `config.xml` back to factory fresh, starting the service and finishing the setup as if no reverse proxy existed, by using http://jira.domain.local:8060 followed by http://jira.domain.local:8060/admin. Once you reach /admin you can configure the reverse proxy under *Global Settings \\ Server*. Put in your proxy scheme, host, port and site URL as required eg.

    Proxy scheme: https
    Proxy host:   jira.domain.local
    Proxy port:   443
    Site URL:     https://jira.domain.local/crucible

We will need these settings put into `config.xml` too, which is shown below. Stop the Crucible service using `bin\stop.sh`. Edit the `config.xml` file and add in the context, site-url, proxy-host, proxy-port and proxy-scheme so it looks something like this: https://gist.github.com/warlord0/c7386086ce86ec3db8fb4de0183cf3c6 Now when you start Crucible using `bin\start.sh` the GUI settings should match the `config.xml` and you can access Crucible at https://jira.domain.local/crucible. All you need to do now is configure it to use a proper database like your existing postgresql and setup the authentication directory to match Jira.

## References

[https://confluence.atlassian.com/fisheye/connecting-to-jira-for-user-management-812223142.html](https://confluence.atlassian.com/fisheye/connecting-to-jira-for-user-management-812223142.html) [https://confluence.atlassian.com/crucible/migrating-to-an-external-database-298977506.html](https://confluence.atlassian.com/crucible/migrating-to-an-external-database-298977506.html)
