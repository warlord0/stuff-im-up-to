---
pubDatetime: 2021-01-15T12:18:09Z
modDatetime: 2021-01-15T12:21:08Z
title: "step-ca and ACME"
tags:
  - "certificates"
  - "Linux"
  - "nginx"
  - "Web"
description: "We have a couple of hundred certs with Let's Encrypt and it is a great service. Right now though we need to issue certs to internal systems and thought it"
---
We have a couple of hundred certs with Let's Encrypt and it is a great service. Right now though we need to issue certs to internal systems and thought it would be great to use the same ACME method to do so.

Add to that we'd like to issue some user certificates to use for user authentication into our web services, we needed to find an Open Source solution to the problem.

Enter [https://smallstep.com/certificates/](https://smallstep.com/certificates/)

There's a docker image for the certificate authority and it couldn't be simpler to setup. Here's my `docker-compose.yml`

```
version: '3.2'

services:
  ca:
    image: ${STEPCA_IMAGE:-smallstep/step-ca}:${STEPCA_IMAGE_VERSION:-latest}
    volumes:
      - "${PWD}/step:/home/step"
    ports:
      - "443:8443"
    healthcheck: 
      test: [ "CMD", "curl", "-k", "https://localhost:8443/health" ] 
      timeout: 30s
      interval: 10s
      retries: 6
```

**Note:** It listens internally on 8443 and the `step` user account can't listen on ports below 1024.

Don't start the container just yet.

I picked a DNS name `ca.domain.local` and added an A record to my DNS server pointing to my service IP. Then initialised the CA using:

```
docker-compose run --rm bash
step ca init --dns ca.domain.local
```

Fill out the questions and for the port type :8443 to match the compose file.

Without leaving the container `bash` install the ACME provisioner.

```
step ca provisioner add domain --type ACME
```

Where you replace **domain** with the name you'd like to see in the ACME url, which looks like this:

```
https://ca.domain.local/acme/domain/directory
```

Exit the `bash` prompt with CTRL+D and start the container.

```
docker-compose up -d
```

Check the logs and test it works using:

```
docker-compose logs
curl -k https://ca.domain.local/acme/domain/directory
```

That's it! You now have a listening ACME server that will issue you with certificates using certbot. The only thing you need to do different is add the `--server` argument to your certbot command line, eg.

```
sudo certbot certonly -d spiffy.domain.local --server https://ca.domain.local/acme/domain/directory
```

You'll go through the usual certbot email and terms acceptance followed by how to issue the cert. Ultimately it ends up in the regular `/etc/letsencrypt` paths and you have your certificate.

> **BUT** it's only valid for 12 hours! WTF?

## How to extend the certificate lifetimes for the step-ca using the ACME challenge method

Edit the `config/ca.json` file either within the container or in the ./step folder and in the ACME section add some lifetimes:

```
           {
                "type": "ACME",
                "name": "domain",
                                "forceCN": true,
                                "claims": {
                                       "maxTLSCertDuration": "2160h",
                                       "defaultTLSCertDuration": "2160h"
                                }
            }
```

The durations are in hours 2160h = 90 days and we're good to go.

Because your initial certificate is so short live you can renew it straight away and get a new 90 day version:

```
sudo certbot renew
```

## Using a Renewal Hooks to Reload Nginx

When certificates get renewed you have to reload Nginx to have it use the newly updated certificate. This can be done using a renewal hook that fires when a certificate is successfully renewed.

Create the file `/etc/letsencrypt/renewal-hooks/deploy/01-reload-nginx` and make it executable with the following content:

```
#!/bin/bash

set -e

/usr/sbin/nginx -t && systemctl reload nginx
```

```
sudo chmod +x /etc/letsencrypt/renewal-hooks/deploy/01-reload-nginx
```

All done. Now when a certificate updates Nginx is ready to serve it.

## References

[https://smallstep.com/docs/tutorials/acme-challenge](https://smallstep.com/docs/tutorials/acme-challenge)
