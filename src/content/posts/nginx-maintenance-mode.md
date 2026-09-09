---
pubDatetime: 2021-02-05T18:10:54Z
modDatetime: 2021-02-09T20:45:33Z
title: "Nginx Maintenance Mode"
tags:
  - "bash"
  - "nginx"
  - "Web"
description: "We use a simple method of putting an Nginx site into maintenance mode. Just set a geo default variable on on and have it generate a HTTP 503 status respons"
---
We use a simple method of putting an Nginx site into maintenance mode. Just set a `geo` default variable on `on` and have it generate a HTTP 503 status response. Then Nginx delivers our maintenance page until we set it back to `off`

#### nginx.conf

```
geo $maintenance_SITE {
    default off;             # Set to 'on' to enable maintenance mode
    123.123.123.120/29 off;
}

upstream maintenance {
    server maint:80;
}

server {
  listen 443 ssl http2;
...
    if ($maintenance_SITE = on) {
        return 503;
    }

    error_page 503 @maintenance;

    location @maintenance {
        rewrite ^(.*)$ / break;
        proxy_pass http://maintenance;
    }
...
}
```

By using a `geo` I can add in our own ip addresses (the /29 range) so everyone but us, gets a 503 maintenance redirect. This way we can continue testing things as if the site were still live.

The next step is to get a script to tell me which sites are in what state and then progress to automating the set maintenance mode on and off.

Because I use a standard template for nginx files I can find the line that drives maintenance mode by looking for `# Set to 'on' to enable maintenance mode`. My script for telling me what the states are needs to `grep` the files in our `nginx/conf.d` folder for this and produce some output. This is what I came up with:

```
#!/bin/bash

# set -x

function get_state() {

    RESULTS=$(grep -E "# Set to 'on' to (enable|put into) maintenance mode" /etc/nginx/conf.d/*.conf)

    IFS=$'\n'
    for RESULT in ${RESULTS}; do
        SERIAL=$(echo ${RESULT} | sed -r -e "s/.*\/(.*)\.conf.*/\1/i")
        STATE=$(echo ${RESULT} | sed -r -e "s/.*default (off|on).*/\1/i")
        echo ${SERIAL} ${STATE}
    done

}

get_state
```

This produces just what I need to see, eg.

```
S00301 off
S00368 off
S00373 off
```

We use unique serial numbers to identify each site, but this would return the name of whatever `.conf` file matched the maintenance string with its current state. The `maintenance_SITE` also has the SERIAL as SITE so we don't put all hosts into maintenance, just the ones we specify by serial number.
