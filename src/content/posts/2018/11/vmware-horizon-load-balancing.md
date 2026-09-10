---
pubDatetime: 2018-11-21T12:19:02Z
modDatetime: 2018-12-04T09:28:17Z
title: "VMWare Horizon Load Balancing"
tags:
  - "Linux"
  - "Networking"
  - "nginx"
  - "proxy"
heroImage: "/blog-media/2016/10/vmware-logo-eps-vector-image-800x533-e1476948729563.png"
description: "We're in the process of installing a new Horizon 7 infrastructure and as part of the process the vendor added load balancers all over the place. I asked wi"
---
We're in the process of installing a new Horizon 7 infrastructure  and as part of the process the vendor added load balancers all over the place. I asked with question of why not use an Open Source solution for that?

My go to web server, proxy, load balancer is Nginx and as we already have a HA pair setup I thought we'd try to use that - even if it meant putting in a new one dedicated to the task in the longer term.

------------------------------------------------------------------------

As the plan is to use a load balancer in front of the connection servers and the only tunnelling that will take place will be for external systems, our requirement will be to LB the https traffic (TCP 443) for the authentication. The PCoIP/Blast traffic will be directed straight to the ESX Host/client.

The [previous document on load balancing with Nginx](/posts/nginx-and-keepalived/) means I only need to add in the config needed for horizon. By using the same [syncing of config](/posts/syncing-config-files-between-servers/) it immediately becomes available on the secondary load balancer.

I created a new config file `/etc/nginx/sites-available/horizon` and then as standard, symbolic link it to `sites-enabled` to make it live.

```
upstream connectionservers {
  ip_hash;
  server 192.168.0.236:443;
  server 192.168.0.237:443;
}
server {
  listen         443 ssl;
  server_name    horizon.domain.tld;
  location ~ / {
    proxy_pass https://connectionservers;
  }
}
```

This adds our two connection servers into an upstream group called `connectionservers` which I then point the  `proxy_pass`  directive to.

The `ip_hash` directive ensures we have session stickiness based on the clients IP address. When a client connects they'll stay directed to the connection server they were given until and unless the connection server becomes unavailable.

### nginx.conf

Within the `nginx.conf` ensure you have the reverse proxy options set in the `http {}` section:

```
enable reverse proxy
proxy_redirect              off;
proxy_set_header            Host            $http_host;
proxy_set_header            X-Real-IP       $remote_addr;
proxy_set_header            X-Forwared-For  $proxy_add_x_forwarded_for;
client_max_body_size        10m;
client_body_buffer_size     128k;
client_header_buffer_size   64k;
proxy_connect_timeout       90;
proxy_send_timeout          90;
proxy_read_timeout          90;
proxy_buffer_size           16k;
proxy_buffers               32  16k;
proxy_busy_buffers_size     64k;
```

The SSL configuration on the HA pair is standard throughout all of our servers that it "proxies" for. We have a wildcard certificate and the HA proxies only services under `*.domain.tld` - our `horizon.domain.tld` fits this pattern so no changes necessary.

All the standard Nginx SSL related security settings for certificate, stapling, ciphers, HSTS are located in our `/etc/nginx/snippets/ssl.conf` file and is included in the `nginx.conf` using:

```
include snippets/ssl.conf
```

### snippets/ssl.conf

```
ssl_certificate /etc/ssl/certs/wildcard.pem;
ssl_certificate_key /etc/ssl/private/wildcard_key.cer;
ssl_dhparam /etc/ssl/private/dhparam.pem;

add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
ssl_session_timeout 1d;
ssl_session_cache shared:SSL:50m;
ssl_session_tickets off;

# modern configuration. tweak to your needs.
ssl_protocols TLSv1.2;
ssl_ciphers 'ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-SHA384:ECDHE-RSA-AES256-SHA384:ECDHE-ECDSA-AES128-SHA256:ECDHE-RSA-AES128-SHA256';
ssl_prefer_server_ciphers on;

# OCSP Stapling ---
# fetch OCSP records from URL in ssl_certificate and cache them
ssl_stapling on;
ssl_stapling_verify on;

add_header X-Content-Type-Options nosniff;
add_header Accept "*";
add_header Access-Control-Allow-Methods "GET, POST, PUT";
add_header Access-Control-Expose-Headers "Authorization";
add_header X-Frame-Options SAMEORIGIN;
add_header X-XSS-Protection "1; mode=block";

proxy_cookie_path / "/; HTTPOnly; Secure";
```

**Note**: Depending on your requirements for other system you may need to include content security policy settings to satisfy [CORS (Cross Origin Resource Sharing)](/posts/cross-origin-resource-sharing-and-content-security-policy/). *In fact you MUST do this to allow Chrome and Firefox to work with Blast over HTML*.

In our PCoIP client we add the new server as `horizon.domain.tld` and we get through the authentication and on to the selection of the available pools. So clearly the load balancing is doing the job. You can check the `/var/log/nginx/access.log` to confirm.

If you miss out the `ip_hash` directive for session stickiness you'll find you can't get past the authentication stage.
