---
pubDatetime: 2024-03-15T17:46:22Z
modDatetime: 2024-03-16T11:01:08Z
title: "Caddy in Production"
tags:
  - "caddy"
  - "Linux"
  - "Web"
heroImage: "/blog-media/2024/03/caddy_logo.png"
description: "To use caddy in production, I needed to make sure it catered for the features I use with Nginx. I need to serve subdomain and handle putting sites into mai"
---
To use caddy in production, I needed to make sure it catered for the features I use with Nginx. I need to serve subdomain and handle putting sites into maintenance to show a visitor a custom 503 (service unavailable) page.

When you install caddy as a package (mine is on Manjaro using pamac), you get the folders created to handle the config (`/etc/caddy`), and a systemd service file. The persistent parts like certificates are stored in `/var/lib/caddy`.

In the `/etc/caddy/Caddyfile` you will find it has an `import` directive that will add files from under `/etc/caddy/conf.d`. Now I can keep all of my site configs in separate files, just like I do with Nginx.

It's important to remember that some things in the caddy config must be in the correct sequence, and that all files in the `conf.d` folder are loaded alphabetically. If you are going to include a global section I would include that in the actual `/etc/caddy/Caddyfile` as putting a global section in a `conf.d` file, would load it in the wrong order, unless you name your files to keep a global section as alphabetically first.

#### /etc/caddy/Caddyfile

```
{
    servers :443 {
        name myServerName
    }
    log {
        output file /var/log/caddy/access.log {
            roll_size 1gb
            roll_keep 10
            roll_keep_for 2160h
        }
    }
}

import /etc/caddy/conf.d/*
```

- I had trouble trying to get the log into `/var/log/caddy` for some reason. Solved by editing the `caddy.service` file and adding the path to `ReadWritePaths`, eg. `ReadWritePaths=/var/lib/caddy /var/log/caddy`

#### conf.d/mysite.conf

```
mysite.domain.tld {
#    error 503 # Maintenance Mode

    redir /tv /tv/

    reverse_proxy /* {
        to 127.0.0.1:3004
        health_uri http://127.0.0.1:3004/
    }
    reverse_proxy /tv/* {
        to 127.0.0.1:8989/tv
        health_uri http://127.0.0.1:8989/tv
    }

    tls {
        dns cloudflare {$CLOUDFLARE_API_KEY}
        resolvers 1.1.1.1
    }

    handle_errors {
        root * /usr/share/caddy/html
        @custom_err file /{err.status_code}.html /50x.html
        handle @custom_err {
          rewrite * {file_match.relative}
          file_server
        }
        respond "{err.status_code} {err.status_text}"
    }
}
```

This will use the Cloudflare DNS API to get a certificate for [https://mysite.domain.tld](#). It will operate a reverse proxy for the paths `/` and `/tv` and direct them to the respective `to` directive in the matching `reverse_proxy` section.

The `handle_errors` section will look for a file with the name matching the HTTP status code in the `root` path and serve the one that matches, or resort to `50x.html`. This means that all I need to do to put the site into maintenance mode is to uncomment the `error 503` line at the beginning of the file, and reload caddy.

What I found nice with this approach is if I stop an underlying Docker service that the reverse proxy is serving, it automatically handles putting that site into maintenance mode.
